import { FilterConfig, parseFilters as commonParseFilters, applyFilters as commonApplyFilters, ParsedFilters } from "../common/filters";
import { YOUTUBE_FILTER_CONFIG, parseFilters as parseYoutubeFilters } from "../youtube/filters";
import { TWITCH_FILTER_CONFIG, parseFilters as parseTwitchFilters } from "../twitch/filters";
import { INSTAGRAM_FILTER_CONFIG, parseFilters as parseInstagramFilters } from "../instagram/filters";
import { TIKTOK_FILTER_CONFIG, parseFilters as parseTiktokFilters } from "../tiktok/filters";
import { FACEBOOK_FILTER_CONFIG, parseFilters as parseFacebookFilters } from "../facebook/filters";
import { X_FILTER_CONFIG, parseFilters as parseXFilters } from "../x/filters";

export const CREATOR_FILTER_CONFIG: FilterConfig = {
    // Exact matches
    exact: {
      visibility: [true, false],
      production: [true, false],
    },
    
    // Search by substring (case-insensitive)
    search: ["name", "description_long", "description_short"],
    
    // Arrays
    arrays: ["category", "country", "label", "language", "contacts"],
    
    // Integer fields with comparison operations (>, <, =, >=, <=)
    integers: ["avg_price", "_creationTime"],
    
    // Sorting
    sortable: ["name", "_creationTime"],

    // Social networks
    socialNetworks: {
      "youtube": YOUTUBE_FILTER_CONFIG,
      "twitch": TWITCH_FILTER_CONFIG,
      "instagram": INSTAGRAM_FILTER_CONFIG,
      "tiktok": TIKTOK_FILTER_CONFIG,
      "facebook": FACEBOOK_FILTER_CONFIG,
      "x": X_FILTER_CONFIG
    },
  };


export function parseFilters(searchParams: URLSearchParams, config: FilterConfig = CREATOR_FILTER_CONFIG): ParsedFilters {
  const socialNetworkParsers = {
    youtube: parseYoutubeFilters,
    twitch: parseTwitchFilters,
    instagram: parseInstagramFilters,
    tiktok: parseTiktokFilters,
    facebook: parseFacebookFilters,
    x: parseXFilters,
  };
  
  return commonParseFilters(searchParams, config, socialNetworkParsers);
}

export function applyFilters(query: any, filters: ParsedFilters) {
  return commonApplyFilters(query, filters);
}