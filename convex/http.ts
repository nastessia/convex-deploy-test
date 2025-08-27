import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

import {
  createCategoryHttp,
  getAllCategoriesHttp,
} from "./backend/category/categories";


import { getCreatorsHttp } from "./backend/creators/get_creators";
import { getCreatorHttp } from "./backend/creators/get_creator";
import { createOrUpdateCreatorsHttp } from "./backend/creators/create_or_update_creators";
import { uploadCreatorAvatar } from "./backend/creators/upload_avatar";

import { getKeywordHttp } from "./backend/keywords/get_keyword";
import { getKeywordsHttp } from "./backend/keywords/get_keywords";
import { updateKeywordExpirationsHttp } from "./backend/keywords/update_expiration_time";
import { createKeywordHttp } from "./backend/keywords/create_keywords";

import { getYoutubeChannelsHttp } from "./backend/youtube/get_youtube_channels";
import { getYoutubeChannelHttp } from "./backend/youtube/get_youtube_channel";

import { getTwitchChannelHttp } from "./backend/twitch/get_twitch_channel";
import { getTwitchChannelsHttp } from "./backend/twitch/get_twitch_channels";

import { getInstagramChannelHttp } from "./backend/instagram/get_instagram_channel";
import { getInstagramChannelsHttp } from "./backend/instagram/get_instagram_channels";

import { getFacebookChannelHttp } from "./backend/facebook/get_facebook_channel";
import { getFacebookChannelsHttp } from "./backend/facebook/get_facebook_channels";

import { getXChannelHttp } from "./backend/x/get_x_channel";
import { getXChannelsHttp } from "./backend/x/get_x_channels";

import { getTiktokChannelHttp } from "./backend/tiktok/get_tiktok_channel";
import { getTiktokChannelsHttp } from "./backend/tiktok/get_tiktok_channels";

import { uploadFile, getFileUrl, deleteFile } from "./backend/files_http";

import {
  validateFullAccessKey,
  validateSmartSocialsAccess,
} from "./backend/auth";
import { onboarding, getUserProfile } from "./backend/users_http";


const http = httpRouter();

// FILES
http.route({
  path: "/files",
  method: "POST",
  handler: uploadFile,
});

http.route({
  path: "/files",
  method: "GET",
  handler: getFileUrl,
});

http.route({
  path: "/files",
  method: "DELETE",
  handler: deleteFile,
});

// CREATORS
http.route({
  path: "/creator",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    await validateFullAccessKey(request);
    return getCreatorHttp(ctx, request);
  }),
});

http.route({
  path: "/creators",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    await validateFullAccessKey(request);
    return getCreatorsHttp(ctx, request);
  }),
});

http.route({
  path: "/creators",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    await validateFullAccessKey(request);
    return createOrUpdateCreatorsHttp(ctx, request);
  }),
});

http.route({
  path: "/creators/avatar",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    await validateFullAccessKey(request);
    return uploadCreatorAvatar(ctx, request);
  }),
});

// YOUTUBE
http.route({
  path: "/youtube-channel",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    await validateFullAccessKey(request);
    return getYoutubeChannelHttp(ctx, request);
  }),
});

http.route({
  path: "/youtube-channels",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    await validateFullAccessKey(request);
    return getYoutubeChannelsHttp(ctx, request);
  }),
});

// TWITCH
http.route({
  path: "/twitch-channel",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    await validateFullAccessKey(request);
    return getTwitchChannelHttp(ctx, request);
  }),
});

http.route({
  path: "/twitch-channels",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    await validateFullAccessKey(request);
    return getTwitchChannelsHttp(ctx, request);
  }),
});

// INSTAGRAM
http.route({
  path: "/instagram-channel",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    await validateFullAccessKey(request);
    return getInstagramChannelHttp(ctx, request);
  }),
});

http.route({
  path: "/instagram-channels",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    await validateFullAccessKey(request);
    return getInstagramChannelsHttp(ctx, request);
  }),
});

// FACEBOOK
http.route({
  path: "/facebook-channel",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    await validateFullAccessKey(request);
    return getFacebookChannelHttp(ctx, request);
  }),
});

http.route({
  path: "/facebook-channels",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    await validateFullAccessKey(request);
    return getFacebookChannelsHttp(ctx, request);
  }),
});

// X
http.route({
  path: "/x-channel",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    await validateFullAccessKey(request);
    return getXChannelHttp(ctx, request);
  }),
});

http.route({
  path: "/x-channels",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    await validateFullAccessKey(request);
    return getXChannelsHttp(ctx, request);
  }),
});

// TIKTOK
http.route({
  path: "/tiktok-channel",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    await validateFullAccessKey(request);
    return getTiktokChannelHttp(ctx, request);
  }),
});

http.route({
  path: "/tiktok-channels",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    await validateFullAccessKey(request);
    return getTiktokChannelsHttp(ctx, request);
  }),
});

// KEYWORDS
http.route({
  path: "/keyword",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    await validateFullAccessKey(request);
    return getKeywordHttp(ctx, request);
  }),
});

http.route({
  path: "/keywords",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    await validateFullAccessKey(request);
    return getKeywordsHttp(ctx, request);
  }),
});

http.route({
  path: "/keywords/update-expirations",
  method: "PATCH",
  handler: httpAction(async (ctx, request) => {
    await validateFullAccessKey(request);
    return updateKeywordExpirationsHttp(ctx, request);
  }),
});

http.route({
  path: "/keywords",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    await validateFullAccessKey(request);
    return createKeywordHttp(ctx, request);
  }),
});

// CAMPAIGNS
http.route({
  path: "/campaigns",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    await validateSmartSocialsAccess(request);
    return getCampaignsHttp(ctx, request);
  }),
});

// CATEGORIES
http.route({
  path: "/categories",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    await validateFullAccessKey(request);
    return getAllCategoriesHttp(ctx, request);
  }),
});

http.route({
  path: "/categories",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    await validateFullAccessKey(request);
    return createCategoryHttp(ctx, request);
  }),
});

// USERS
http.route({
  path: "/users",
  method: "PATCH",
  handler: httpAction(async (ctx, request) => {
    await validateFullAccessKey(request);
    return onboarding(ctx, request);
  }),
});

http.route({
  path: "/users",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    await validateFullAccessKey(request);
    return getUserProfile(ctx, request);
  }),
});

// SOCIAL STATS
http.route({
  path: "/stats/update",
  method: "PATCH",
  handler: httpAction(async (ctx, request) => {
    await validateFullAccessKey(request);
    await ctx.runAction(
      internal.scheduled.updateSocialStats.updateNewCreatorsStats
    );
    return new Response("Stats update triggered successfully", { status: 200 });
  }),
});

http.route({
  path: "/stats/update-creator",
  method: "PATCH",
  handler: httpAction(async (ctx, request) => {
    await validateFullAccessKey(request);
    const body = await request.json();
    const { creatorId, creatorName } = body;

    if (!creatorId && !creatorName) {
      return new Response("Either creatorId or creatorName must be provided", {
        status: 400,
      });
    }

    await ctx.runAction(
      internal.scheduled.updateSocialStats.updateCreatorStats,
      {
        creatorId,
        creatorName,
      }
    );

    return new Response("Creator stats update triggered successfully", {
      status: 200,
    });
  }),
});

export default http;
