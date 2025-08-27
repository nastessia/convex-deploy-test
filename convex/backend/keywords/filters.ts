// Interfaces for keyword filtering
export interface KeywordFilters {
  // Exact matches
  exact: Record<string, string | boolean | number>;
  
  // Substring search (case insensitive)
  search: Record<string, string>;
  
  // Arrays (contains any)
  arrays: Record<string, string[]>;
  
  // Numeric fields with comparison operations (>, <, =, >=, <=)
  integers: Record<string, { operator: string; value: number }[]>;
  
  // Dates in Unix timestamp format (milliseconds) with comparison operations
  dates: Record<string, { operator: string; value: number }[]>;
}

// Filter configuration for keywords
export const KEYWORDS_FILTER_CONFIG = {
  // Exact matches
  exact: {
    keyword: [] as string[], // Exact keyword match
  },
  
  // Substring search (case insensitive)
  search: ["keyword"], // Search by keyword
  
  // Arrays
  arrays: ["category", "country", "label", "language"],
  
  // Numeric fields with comparison operations (non-date fields)
  integers: [
    "channels_for_last_run", 
    "expected_channels_for_task", 
    "update_period_days"
  ],
  
  // Date fields in Unix timestamp format (milliseconds)
  dates: [
    "expirations_time", 
    "last_run",
    "_creationTime"
  ],
  
  // Sortable fields
  sortable: ["keyword", "expirations_time", "last_run", "update_period_days", "_creationTime"],
};

// Filter parsing function for keywords
export function parseFilters(searchParams: URLSearchParams): KeywordFilters {
  const filters: KeywordFilters = {
    exact: {},
    search: {},
    arrays: {},
    integers: {},
    dates: {},
  };

  for (const [key, value] of searchParams.entries()) {
    if (!value) continue;

    // Exact matches
    if (key in KEYWORDS_FILTER_CONFIG.exact) {
      filters.exact[key] = value;
    }
    
    // Substring search
    else if (KEYWORDS_FILTER_CONFIG.search.includes(key)) {
      filters.search[key] = value;
    }
    
    // Arrays
    else if (KEYWORDS_FILTER_CONFIG.arrays.includes(key)) {
      filters.arrays[key] = value.split(',').map(v => v.trim());
    }
    
    // Numeric fields with operators
    else if (KEYWORDS_FILTER_CONFIG.integers.some(field => key.startsWith(field))) {
      // Parse field and operator from key
      // Examples: channels_for_last_run_gte=1000, update_period_days_lt=30
      const matchedField = KEYWORDS_FILTER_CONFIG.integers.find(field => key.startsWith(field));
      if (matchedField) {
        const operatorSuffix = key.substring(matchedField.length);
        let operator = 'eq'; // default
        
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
    
    // Date fields (Unix timestamp in milliseconds)
    else if (KEYWORDS_FILTER_CONFIG.dates.some(field => key.startsWith(field))) {
      // Parse field and operator from key
      // Examples: expirations_time_gte=1751442403451.4736, last_run_lt=1751442403451.4736
      const matchedField = KEYWORDS_FILTER_CONFIG.dates.find(field => key.startsWith(field));
      if (matchedField) {
        const operatorSuffix = key.substring(matchedField.length);
        let operator = 'eq'; // default
        
        if (operatorSuffix.startsWith('_')) {
          const op = operatorSuffix.substring(1);
          if (['gt', 'gte', 'lt', 'lte', 'eq'].includes(op)) {
            operator = op;
          }
        } else if (key === matchedField) {
          operator = 'eq'; // exact field name without suffix means equality
        }
        
        // Parse Unix timestamp with support for fractional part
        const timestamp = parseFloat(value);
        if (!isNaN(timestamp) && timestamp > 0) {
          if (!filters.dates[matchedField]) {
            filters.dates[matchedField] = [];
          }
          filters.dates[matchedField].push({ operator, value: timestamp });
        }
      }
    }
  }

  return filters;
}

// Filter application function for keywords
export function applyFilters(query: any, filters: KeywordFilters) {
  const conditions: any[] = [];

  // Exact matches
  for (const [field, value] of Object.entries(filters.exact || {})) {
    conditions.push((q: any) => q.eq(q.field(field), value));
  }

  // Substring search (currently exact match, can be extended)
  for (const [field, value] of Object.entries(filters.search || {})) {
    // For substring search should use contains, but currently using eq
    conditions.push((q: any) => q.eq(q.field(field), value));
  }

  // Numeric filters with comparison operations
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
          default:
            conditions.push((q: any) => q.eq(q.field(field), op.value));
            break;
        }
      }
    }
  }

  // Date filters (Unix timestamp in milliseconds)
  for (const [field, operations] of Object.entries(filters.dates || {})) {
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
          default:
            conditions.push((q: any) => q.eq(q.field(field), op.value));
            break;
        }
      }
    }
  }

  // Arrays (contains any)
  for (const [field, values] of Object.entries(filters.arrays || {})) {
    if (Array.isArray(values) && values.length > 0) {
      // Create condition for each value in array
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
