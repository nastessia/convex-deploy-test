// Universal filter interfaces
export interface FilterConfig {
  // Exact matches
  exact: Record<string, (string | boolean | number)[]>;
  
  // Substring search (case insensitive)
  search: string[];
  
  // Arrays
  arrays: string[];
  
  // Numeric fields with comparison operations (>, <, =, >=, <=)
  integers: string[];
  
  // Sortable fields
  sortable: string[];
  
  // Social networks (optional)
  socialNetworks?: Record<string, FilterConfig>;
}

// Filter parsing result
export interface ParsedFilters {
  exact: Record<string, string | boolean>;
  search: Record<string, string>;
  arrays: Record<string, string[]>;
  integers: Record<string, { operator: string; value: number }[]>;
  socialNetworks?: Record<string, ParsedFilters>;
}

// Universal function for parsing filters
export function parseFilters<T extends FilterConfig>(
  searchParams: URLSearchParams, 
  config: T,
  socialNetworkParsers?: Record<string, (params: URLSearchParams, config: FilterConfig) => ParsedFilters>
): ParsedFilters {
  const filters: ParsedFilters = {
    exact: {},
    search: {},
    arrays: {},
    integers: {},
  };

  for (const [key, value] of searchParams.entries()) {
    if (!value) continue;

    // Exact filters
    if (key in config.exact) {
      const allowedValues = config.exact[key];
      let convertedValue: string | boolean = value;
      if (value === "true") convertedValue = true;
      if (value === "false") convertedValue = false;
      
      if (allowedValues.length === 0 || allowedValues.includes(convertedValue)) {
        filters.exact[key] = convertedValue;
      }
    }
    
    // Search filters
    else if (config.search.includes(key)) {
      filters.search[key] = value;
    }
    
    // Array filters
    else if (config.arrays.includes(key)) {
      filters.arrays[key] = value.split(',').map(v => v.trim());
    }
    
    // Numeric filters with operators
    else if (config.integers.some(field => key.startsWith(field))) {
      // Parse field name and operator from key
      // Examples: subscribers_gte=1000
      const matchedField = config.integers.find(field => key.startsWith(field));
      if (matchedField) {
        const operatorSuffix = key.substring(matchedField.length);
        let operator = '='; // default
        
        if (operatorSuffix.startsWith('_')) {
          const op = operatorSuffix.substring(1);
          if (['gt', 'gte', 'lt', 'lte', 'eq'].includes(op)) {
            operator = op;
          }
        } else if (key === matchedField) {
          operator = 'eq'; // exact field name without suffix means equality
        }
        
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          if (!filters.integers[matchedField]) {
            filters.integers[matchedField] = [];
          }
          filters.integers[matchedField].push({ operator, value: numValue });
        }
      }
    }

    // Social networks
    else if (config.socialNetworks && socialNetworkParsers) {
      // Check if key starts with social network prefix
      for (const [networkName, networkConfig] of Object.entries(config.socialNetworks)) {
        if (key.startsWith(networkName + '_')) {
          // Extract actual filter key without network prefix
          const filterKey = key.substring(networkName.length + 1);
          
          // Create temporary URLSearchParams for this single filter
          const tempParams = new URLSearchParams();
          tempParams.set(filterKey, value);
          
          // Parse using network-specific parseFilters function
          const parser = socialNetworkParsers[networkName];
          if (parser) {
            const networkFilters = parser(tempParams, networkConfig);
            
            // Add to filters with network prefix
            if (!filters.socialNetworks) {
              filters.socialNetworks = {};
            }
            if (!filters.socialNetworks[networkName]) {
              filters.socialNetworks[networkName] = {
                exact: {},
                search: {},
                arrays: {},
                integers: {},
              };
            }
            
            // Merge parsed network filters
            Object.assign(filters.socialNetworks[networkName].exact, networkFilters.exact);
            Object.assign(filters.socialNetworks[networkName].search, networkFilters.search);
            Object.assign(filters.socialNetworks[networkName].arrays, networkFilters.arrays);
            Object.assign(filters.socialNetworks[networkName].integers, networkFilters.integers);
            
            break; // Exit loop when found matching network
          }
        }
      }
    }
  }

  return filters;
}

// Universal function for applying filters
export function applyFilters(query: any, filters: ParsedFilters) {
  const conditions: any[] = [];

  // Exact matches
  for (const [field, value] of Object.entries(filters.exact || {})) {
    if (typeof value === 'boolean' && value === false) {
      // For boolean fields need to handle false and undefined separately
      conditions.push((q: any) => q.or(
        q.eq(q.field(field), false),
        q.eq(q.field(field), undefined)
      ));
    } else {
      conditions.push((q: any) => q.eq(q.field(field), value));
    }
  }

  // Note: Search filters are NOT applied here as Convex doesn't support substring queries
  // They will be applied after data retrieval using applySearchFilters function

  // Numeric filters with comparison operators
  for (const [field, operations] of Object.entries(filters.integers || {})) {
    if (Array.isArray(operations) && operations.length > 0) {
      for (const op of operations) {
        switch (op.operator) {
          case 'gt':
            conditions.push((q: any) => q.gt(q.field(field), op.value));
            break;
          case 'gte':
            conditions.push((q: any) => q.gte(q.field(field), op.value));
            break;
          case 'lt':
            conditions.push((q: any) => q.lt(q.field(field), op.value));
            break;
          case 'lte':
            conditions.push((q: any) => q.lte(q.field(field), op.value));
            break;
          case 'eq':
          case '=':
          default:
            conditions.push((q: any) => q.eq(q.field(field), op.value));
            break;
        }
      }
    }
  }

  // Array filters (contains any)
  for (const [field, values] of Object.entries(filters.arrays || {})) {
    if (Array.isArray(values) && values.length > 0) {
      const arrayConditions = values.map(value => 
        (q: any) => q.eq(q.field(field), value)
      );
      conditions.push((q: any) => q.or(...arrayConditions.map(cond => cond(q))));
    }
  }

  // Apply all conditions
  if (conditions.length > 0) {
    query = query.filter((q: any) => {
      if (conditions.length === 1) {
        return conditions[0](q);
      }
      return q.and(...conditions.map(cond => cond(q)));
    });
  }

  return query;
}

// Function to apply search filters after data retrieval
export function applySearchFilters<T extends Record<string, any>>(items: T[], searchFilters: Record<string, string>): T[] {
  if (!searchFilters || Object.keys(searchFilters).length === 0) {
    return items;
  }

  return items.filter(item => {
    for (const [field, searchValue] of Object.entries(searchFilters)) {
      const fieldValue = item[field];
      if (typeof fieldValue === 'string') {
        if (!fieldValue.toLowerCase().includes(searchValue.toLowerCase())) {
          return false;
        }
      } else {
        // If field is not a string or doesn't exist, this item doesn't match
        return false;
      }
    }
    return true;
  });
}
