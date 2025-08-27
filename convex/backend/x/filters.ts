import { FilterConfig, parseFilters as commonParseFilters, applyFilters as commonApplyFilters, ParsedFilters } from "../common/filters";

// TODO: fields to be added when we have data
export const X_FILTER_CONFIG: FilterConfig = {
    // Exact matches
    exact: {
      processed: [true, false],
      to_be_updated: [true, false],
      not_found: [true, false],
      is_active: [true, false],
      primary: [true, false],
    },
    
    // Search by substring (case-insensitive)
    search: ["channel_id"],
    
    // Arrays
    arrays: [],
    
    // Integer fields with comparison operations (>, <, =, >=, <=)
    integers: [],
    
    // Sorting
    sortable: ["channel_id", "_creationTime"],
  };

export function parseFilters(searchParams: URLSearchParams, config: FilterConfig = X_FILTER_CONFIG): ParsedFilters {
  return commonParseFilters(searchParams, config);
}

export function applyFilters(query: any, filters: ParsedFilters) {
  return commonApplyFilters(query, filters);
}