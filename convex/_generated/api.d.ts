/* prettier-ignore-start */

/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as backend_auth from "../backend/auth.js";
import type * as backend_category_categories from "../backend/category/categories.js";
import type * as backend_common_filters from "../backend/common/filters.js";
import type * as backend_creators_create_or_update_creators from "../backend/creators/create_or_update_creators.js";
import type * as backend_creators_filters from "../backend/creators/filters.js";
import type * as backend_creators_get_creator from "../backend/creators/get_creator.js";
import type * as backend_creators_get_creators from "../backend/creators/get_creators.js";
import type * as backend_creators_upload_avatar from "../backend/creators/upload_avatar.js";
import type * as backend_facebook_filters from "../backend/facebook/filters.js";
import type * as backend_facebook_get_facebook_channel from "../backend/facebook/get_facebook_channel.js";
import type * as backend_facebook_get_facebook_channels from "../backend/facebook/get_facebook_channels.js";
import type * as backend_files_http from "../backend/files_http.js";
import type * as backend_instagram_filters from "../backend/instagram/filters.js";
import type * as backend_instagram_get_instagram_channel from "../backend/instagram/get_instagram_channel.js";
import type * as backend_instagram_get_instagram_channels from "../backend/instagram/get_instagram_channels.js";
import type * as backend_keywords_create_keywords from "../backend/keywords/create_keywords.js";
import type * as backend_keywords_filters from "../backend/keywords/filters.js";
import type * as backend_keywords_get_keyword from "../backend/keywords/get_keyword.js";
import type * as backend_keywords_get_keywords from "../backend/keywords/get_keywords.js";
import type * as backend_keywords_update_expiration_time from "../backend/keywords/update_expiration_time.js";
import type * as backend_tiktok_filters from "../backend/tiktok/filters.js";
import type * as backend_tiktok_get_tiktok_channel from "../backend/tiktok/get_tiktok_channel.js";
import type * as backend_tiktok_get_tiktok_channels from "../backend/tiktok/get_tiktok_channels.js";
import type * as backend_twitch_filters from "../backend/twitch/filters.js";
import type * as backend_twitch_get_twitch_channel from "../backend/twitch/get_twitch_channel.js";
import type * as backend_twitch_get_twitch_channels from "../backend/twitch/get_twitch_channels.js";
import type * as backend_users_http from "../backend/users_http.js";
import type * as backend_x_filters from "../backend/x/filters.js";
import type * as backend_x_get_x_channel from "../backend/x/get_x_channel.js";
import type * as backend_x_get_x_channels from "../backend/x/get_x_channels.js";
import type * as backend_youtube_filters from "../backend/youtube/filters.js";
import type * as backend_youtube_get_youtube_channel from "../backend/youtube/get_youtube_channel.js";
import type * as backend_youtube_get_youtube_channels from "../backend/youtube/get_youtube_channels.js";
import type * as http from "../http.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  "backend/auth": typeof backend_auth;
  "backend/category/categories": typeof backend_category_categories;
  "backend/common/filters": typeof backend_common_filters;
  "backend/creators/create_or_update_creators": typeof backend_creators_create_or_update_creators;
  "backend/creators/filters": typeof backend_creators_filters;
  "backend/creators/get_creator": typeof backend_creators_get_creator;
  "backend/creators/get_creators": typeof backend_creators_get_creators;
  "backend/creators/upload_avatar": typeof backend_creators_upload_avatar;
  "backend/facebook/filters": typeof backend_facebook_filters;
  "backend/facebook/get_facebook_channel": typeof backend_facebook_get_facebook_channel;
  "backend/facebook/get_facebook_channels": typeof backend_facebook_get_facebook_channels;
  "backend/files_http": typeof backend_files_http;
  "backend/instagram/filters": typeof backend_instagram_filters;
  "backend/instagram/get_instagram_channel": typeof backend_instagram_get_instagram_channel;
  "backend/instagram/get_instagram_channels": typeof backend_instagram_get_instagram_channels;
  "backend/keywords/create_keywords": typeof backend_keywords_create_keywords;
  "backend/keywords/filters": typeof backend_keywords_filters;
  "backend/keywords/get_keyword": typeof backend_keywords_get_keyword;
  "backend/keywords/get_keywords": typeof backend_keywords_get_keywords;
  "backend/keywords/update_expiration_time": typeof backend_keywords_update_expiration_time;
  "backend/tiktok/filters": typeof backend_tiktok_filters;
  "backend/tiktok/get_tiktok_channel": typeof backend_tiktok_get_tiktok_channel;
  "backend/tiktok/get_tiktok_channels": typeof backend_tiktok_get_tiktok_channels;
  "backend/twitch/filters": typeof backend_twitch_filters;
  "backend/twitch/get_twitch_channel": typeof backend_twitch_get_twitch_channel;
  "backend/twitch/get_twitch_channels": typeof backend_twitch_get_twitch_channels;
  "backend/users_http": typeof backend_users_http;
  "backend/x/filters": typeof backend_x_filters;
  "backend/x/get_x_channel": typeof backend_x_get_x_channel;
  "backend/x/get_x_channels": typeof backend_x_get_x_channels;
  "backend/youtube/filters": typeof backend_youtube_filters;
  "backend/youtube/get_youtube_channel": typeof backend_youtube_get_youtube_channel;
  "backend/youtube/get_youtube_channels": typeof backend_youtube_get_youtube_channels;
  http: typeof http;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

/* prettier-ignore-end */
