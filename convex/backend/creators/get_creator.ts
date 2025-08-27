import { internal } from "../../_generated/api";
import { httpAction } from "../../_generated/server";
import { query } from "../../_generated/server";
import { v } from "convex/values";

// Helper function to process fields filter and maintain original data structure
async function processFieldsFilter(ctx: any, creatorId: any, fieldsParam: string, baseResult: any) {
  const requestedFields = fieldsParam.split(',').map(field => field.trim());
  const filteredResult: any = {};
  
  // Available social media platforms
  const socialPlatforms = [
    'youtube_channels',
    'instagram_channels', 
    'tiktok_channels',
    'twitch_channels',
    'facebook_channels',
    'x_channels'
  ];
  
  // Platform prefix mapping
  const platformPrefixes: { [key: string]: string } = {
    'youtube_channels': 'youtube',
    'instagram_channels': 'instagram',
    'tiktok_channels': 'tiktok', 
    'twitch_channels': 'twitch',
    'facebook_channels': 'facebook',
    'x_channels': 'x'
  };
  
  // Collect social media fields that need to be fetched
  const platformsNeeded = new Set<string>();
  const socialFieldsNeeded: { [platform: string]: Set<string> } = {};
  let needsSocialMedia = false;
  
  for (const field of requestedFields) {
    // Check if it's a regular creator field
    if (field in baseResult) {
      filteredResult[field] = baseResult[field];
      continue;
    }
    
    // Check if it's a social media field (format: platform_fieldname)
    for (const platform of socialPlatforms) {
      const prefix = platformPrefixes[platform];
      if (field.startsWith(prefix + '_')) {
        const socialFieldName = field.substring(prefix.length + 1);
        platformsNeeded.add(platform);
        needsSocialMedia = true;
        
        if (!socialFieldsNeeded[prefix]) {
          socialFieldsNeeded[prefix] = new Set();
        }
        socialFieldsNeeded[prefix].add(socialFieldName);
        break;
      }
    }
  }
  
  // If social media fields are needed, create socialMedia structure
  if (needsSocialMedia) {
    filteredResult.socialMedia = {};
    
    // Load social media data for needed platforms
    const socialData: { [platform: string]: any[] } = {};
    for (const platform of platformsNeeded) {
      socialData[platform] = await ctx.db
        .query(platform)
        .withIndex("by_creator_id", (q: any) => q.eq("creator_id", creatorId))
        .collect();
    }
    
    // Process each platform
    for (const [platform, prefix] of Object.entries(platformPrefixes)) {
      if (platformsNeeded.has(platform)) {
        const channels = socialData[platform] || [];
        const fieldsForPlatform = socialFieldsNeeded[prefix];
        
        if (fieldsForPlatform && fieldsForPlatform.size > 0) {
          // Filter channels to only include requested fields
          const filteredChannels = channels.map(channel => {
            const filteredChannel: any = {};
            for (const fieldName of fieldsForPlatform) {
              if (channel[fieldName] !== undefined) {
                filteredChannel[fieldName] = channel[fieldName];
              }
            }
            return filteredChannel;
          }).filter(channel => Object.keys(channel).length > 0); // Only include channels that have at least one requested field
          
          filteredResult.socialMedia[prefix] = filteredChannels;
        } else {
          filteredResult.socialMedia[prefix] = [];
        }
      }
    }
  }
  
  return filteredResult;
}

export const getCreator = query({
  args: {
    id: v.optional(v.id("creators")),
    name: v.optional(v.string()),
    youtube_id: v.optional(v.id("youtube_channels")),
    instagram_id: v.optional(v.id("instagram_channels")),
    tiktok_id: v.optional(v.id("tiktok_channels")),
    twitch_id: v.optional(v.id("twitch_channels")),
    facebook_id: v.optional(v.id("facebook_channels")),
    x_id: v.optional(v.id("x_channels")),
    youtube_channel_id: v.optional(v.string()),
    instagram_channel_id: v.optional(v.string()),
    tiktok_channel_id: v.optional(v.string()),
    twitch_channel_id: v.optional(v.string()),
    facebook_channel_id: v.optional(v.string()),
    x_channel_id: v.optional(v.string()),

    full: v.optional(v.boolean()),
    fields: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let creator = null;

    // Search by creator ID
    if (args.id) {
      creator = await ctx.db.get(args.id);
    }
    // Search by name
    else if (args.name) {
      creator = await ctx.db
        .query("creators")
        .filter((q) => q.eq(q.field("name"), args.name))
        .first();
    }
    // Search by social media channel IDs
    else if (args.youtube_channel_id) {
      const channel = await ctx.db
        .query("youtube_channels")
        .filter((q) => q.eq(q.field("channel_id"), args.youtube_channel_id))
        .first();
      if (channel) {
        creator = await ctx.db.get(channel.creator_id);
      }
    }
    else if (args.instagram_channel_id) {
      const channel = await ctx.db
        .query("instagram_channels")
        .filter((q) => q.eq(q.field("channel_id"), args.instagram_channel_id))
        .first();
      if (channel) {
        creator = await ctx.db.get(channel.creator_id);
      }
    }
    else if (args.tiktok_channel_id) {
      const channel = await ctx.db
        .query("tiktok_channels")
        .filter((q) => q.eq(q.field("channel_id"), args.tiktok_channel_id))
        .first();
      if (channel) {
        creator = await ctx.db.get(channel.creator_id);
      }
    }
    else if (args.twitch_channel_id) {
      const channel = await ctx.db
        .query("twitch_channels")
        .filter((q) => q.eq(q.field("channel_id"), args.twitch_channel_id))
        .first();
      if (channel) {
        creator = await ctx.db.get(channel.creator_id);
      }
    }
    else if (args.facebook_channel_id) {
      const channel = await ctx.db
        .query("facebook_channels")
        .filter((q) => q.eq(q.field("channel_id"), args.facebook_channel_id))
        .first();
      if (channel) {
        creator = await ctx.db.get(channel.creator_id);
      }
    }
    else if (args.x_channel_id) {
      const channel = await ctx.db
        .query("x_channels")
        .filter((q) => q.eq(q.field("channel_id"), args.x_channel_id))
        .first();
      if (channel) {
        creator = await ctx.db.get(channel.creator_id);
      }
    }
    // Search by social media database IDs
    else if (args.youtube_id) {
      const channel = await ctx.db.get(args.youtube_id);
      if (channel) {
        creator = await ctx.db.get(channel.creator_id);
      }
    }
    else if (args.instagram_id) {
      const channel = await ctx.db.get(args.instagram_id);
      if (channel) {
        creator = await ctx.db.get(channel.creator_id);
      }
    }
    else if (args.tiktok_id) {
      const channel = await ctx.db.get(args.tiktok_id);
      if (channel) {
        creator = await ctx.db.get(channel.creator_id);
      }
    }
    else if (args.twitch_id) {
      const channel = await ctx.db.get(args.twitch_id);
      if (channel) {
        creator = await ctx.db.get(channel.creator_id);
      }
    }
    else if (args.facebook_id) {
      const channel = await ctx.db.get(args.facebook_id);
      if (channel) {
        creator = await ctx.db.get(channel.creator_id);
      }
    }
    else if (args.x_id) {
      const channel = await ctx.db.get(args.x_id);
      if (channel) {
        creator = await ctx.db.get(channel.creator_id);
      }
    }

    if (!creator) {
      return null;
    }

    let result: any = creator;

    // If full=true, load social media data
    if (args.full) {
      const [youtube, instagram, tiktok, twitch, facebook, x] = await Promise.all([
        ctx.db.query("youtube_channels").withIndex("by_creator_id", q => q.eq("creator_id", creator._id)).collect(),
        ctx.db.query("instagram_channels").withIndex("by_creator_id", q => q.eq("creator_id", creator._id)).collect(),
        ctx.db.query("tiktok_channels").withIndex("by_creator_id", q => q.eq("creator_id", creator._id)).collect(),
        ctx.db.query("twitch_channels").withIndex("by_creator_id", q => q.eq("creator_id", creator._id)).collect(),
        ctx.db.query("facebook_channels").withIndex("by_creator_id", q => q.eq("creator_id", creator._id)).collect(),
        ctx.db.query("x_channels").withIndex("by_creator_id", q => q.eq("creator_id", creator._id)).collect(),
      ]);

      result = {
        ...creator,
        socialMedia: {
          youtube,
          instagram, 
          tiktok,
          twitch,
          facebook,
          x
        }
      };
    }

    // If fields parameter is specified, return only requested fields
    if (args.fields) {
      return await processFieldsFilter(ctx, creator._id, args.fields, result);
    }

    return result;
  },
});


export const getCreatorHttp = httpAction(
  async (ctx, request) => {
    try {
      const url = new URL(request.url);
      const searchParams = url.searchParams;

      // Extract search parameters
      const id = searchParams.get("id");
      const name = searchParams.get("name");
      const youtube_id = searchParams.get("youtube_id");
      const instagram_id = searchParams.get("instagram_id");
      const tiktok_id = searchParams.get("tiktok_id");
      const twitch_id = searchParams.get("twitch_id");
      const facebook_id = searchParams.get("facebook_id");
      const x_id = searchParams.get("x_id");
      const youtube_channel_id = searchParams.get("youtube_channel_id");
      const instagram_channel_id = searchParams.get("instagram_channel_id");
      const tiktok_channel_id = searchParams.get("tiktok_channel_id");
      const twitch_channel_id = searchParams.get("twitch_channel_id");
      const facebook_channel_id = searchParams.get("facebook_channel_id");
      const x_channel_id = searchParams.get("x_channel_id");
      const full = searchParams.get("full") === "true";
      const fields = searchParams.get("fields");

      // Check that at least one search parameter is provided
      if (!id && !name && !youtube_id && !instagram_id && !tiktok_id && !twitch_id && 
          !facebook_id && !x_id && !youtube_channel_id && !instagram_channel_id && 
          !tiktok_channel_id && !twitch_channel_id && !facebook_channel_id && !x_channel_id) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "At least one search parameter is required (id, name, or any social media identifier)" 
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const result = await ctx.runQuery(internal.backend.creators.get_creator.getCreator, {
        id: id ? id as any : undefined,
        name: name || undefined,
        youtube_id: youtube_id ? youtube_id as any : undefined,
        instagram_id: instagram_id ? instagram_id as any : undefined,
        tiktok_id: tiktok_id ? tiktok_id as any : undefined,
        twitch_id: twitch_id ? twitch_id as any : undefined,
        facebook_id: facebook_id ? facebook_id as any : undefined,
        x_id: x_id ? x_id as any : undefined,
        youtube_channel_id: youtube_channel_id || undefined,
        instagram_channel_id: instagram_channel_id || undefined,
        tiktok_channel_id: tiktok_channel_id || undefined,
        twitch_channel_id: twitch_channel_id || undefined,
        facebook_channel_id: facebook_channel_id || undefined,
        x_channel_id: x_channel_id || undefined,
        full,
        fields: fields || undefined,
      });

      if (!result) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Creator not found",
          }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          data: result,
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to fetch creator",
          message: error instanceof Error ? error.message : "Unknown error",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }
);
