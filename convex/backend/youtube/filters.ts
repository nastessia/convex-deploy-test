import { FilterConfig, parseFilters as commonParseFilters, applyFilters as commonApplyFilters, ParsedFilters } from "../common/filters";

export const YOUTUBE_FILTER_CONFIG: FilterConfig = {
    // Exact matches
    exact: {
      processed: [true, false],
      to_be_updated: [true, false],
      not_found: [true, false],
      is_active: [true, false],
      is_empty: [true, false],
      is_verified: [true, false],
      primary: [true, false],
      frequency: ["high", "medium", "low"],
    },
    
    // Search by substring (case-insensitive)
    search: ["username", "channel_id"],
    
    // Arrays
    arrays: ["location"],
    
    // Integer fields with comparison operations (>, <, =, >=, <=)
    integers: ["subscribers", "views", "videos_count", "average_comments", "average_likes", "average_viewers", "median_comments", "median_likes", "median_viewers"],
    
    // Sorting
    sortable: ["channel_id", "_creationTime"],
  };

export function parseFilters(searchParams: URLSearchParams, config: FilterConfig = YOUTUBE_FILTER_CONFIG): ParsedFilters {
  return commonParseFilters(searchParams, config);
}

export function applyFilters(query: any, filters: ParsedFilters) {
  return commonApplyFilters(query, filters);
}