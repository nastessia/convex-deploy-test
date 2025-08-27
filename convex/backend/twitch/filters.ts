import { FilterConfig, parseFilters as commonParseFilters, applyFilters as commonApplyFilters, ParsedFilters } from "../common/filters";

export const TWITCH_FILTER_CONFIG: FilterConfig = {
    // Exact matches
    exact: {
      processed: [true, false],
      to_be_updated: [true, false],
      not_found: [true, false],
      is_active: [true, false],
      primary: [true, false],
    },
    
    // Search by substring (case-insensitive)
    search: ["username", "channel_id"],
    
    // Arrays
    arrays: [],
    
    // Integer fields with comparison operations (>, <, =, >=, <=)
    integers: ["followers", "average_stream_length", "average_viewers", "average_watch_time", "median_stream_length", "median_viewers", "median_watch_time"],
    
    // Sorting
    sortable: ["channel_id", "_creationTime"],
  };

export function parseFilters(searchParams: URLSearchParams, config: FilterConfig = TWITCH_FILTER_CONFIG): ParsedFilters {
  return commonParseFilters(searchParams, config);
}

export function applyFilters(query: any, filters: ParsedFilters) {
  return commonApplyFilters(query, filters);
}