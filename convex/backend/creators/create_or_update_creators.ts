import { httpAction } from "../../_generated/server";
import { mutation } from "../../_generated/server";
import { v } from "convex/values";
import { internal } from "../../_generated/api";

const creatorValidator = v.any();

// Universal function for processing one type of channels
async function processChannelType(
  ctx: any, 
  creatorId: any, 
  channels: any[], 
  networkName: string, 
  tableName: string
) {
  let createdCount = 0;
  let updatedCount = 0;

  for (const channel of channels) {
    const existingChannel = await ctx.db
      .query(tableName)
      .withIndex("by_channel", (q: any) => q.eq("channel_id", channel.channel_id))
      .first();

    if (existingChannel) {
      // Check if we need to update creator_id
      if (existingChannel.creator_id !== creatorId) {
        await ctx.db.patch(existingChannel._id, { creator_id: creatorId });
        updatedCount++;
      }
      
      // Update other channel fields
      const updateData: any = {};
      for (const [key, value] of Object.entries(channel)) {
        if (key !== "channel_id" && value !== undefined) {
          updateData[key] = value;
        }
      }
      
      if (Object.keys(updateData).length > 0) {
        await ctx.db.patch(existingChannel._id, updateData);
        if (existingChannel.creator_id === creatorId) {
          updatedCount++;
        }
      }
    } else {
      // Create new channel
      await ctx.db.insert(tableName, {
        ...channel,
        creator_id: creatorId,
      });
      createdCount++;
    }
  }

  return { created: createdCount, updated: updatedCount };
}

// Function for processing channels
async function processChannels(ctx: any, creatorId: any, channels: any) {
  let totalCreated = 0;
  let totalUpdated = 0;

  // Map of networks to tables
  const networkTableMap: Record<string, string> = {
    youtube: "youtube_channels",
    twitch: "twitch_channels", 
    instagram: "instagram_channels",
    tiktok: "tiktok_channels",
    facebook: "facebook_channels",
    x: "x_channels"
  };

  // Process each type of channels
  for (const [networkName, channelList] of Object.entries(channels)) {
    if (Array.isArray(channelList) && networkTableMap[networkName]) {
      const result = await processChannelType(
        ctx, 
        creatorId, 
        channelList, 
        networkName, 
        networkTableMap[networkName]
      );
      totalCreated += result.created;
      totalUpdated += result.updated;
    }
  }

  return { created: totalCreated, updated: totalUpdated };
}



// Mutation for batch processing of creators
export const batchUpsertCreators = mutation({
  args: {
    creators: v.array(creatorValidator),
  },
  handler: async (ctx, args) => {
    const results = [];
    let totalCreated = 0;
    let totalUpdated = 0;
    let totalErrors = 0;

    for (const creatorData of args.creators) {
      try {
        // Check that either name or id is provided
        const hasName = creatorData.name && typeof creatorData.name === "string";
        const hasId = creatorData.id && typeof creatorData.id === "string";
        
        if (!hasName && !hasId) {
          throw new Error("Either 'name' or 'id' field is required and must be a string");
        }
        
        if (hasName && hasId) {
          throw new Error("Cannot specify both 'name' and 'id' fields");
        }
        
        // Find existing creator by name or id
        let existingCreator;
        if (hasId) {
          // Search by ID - need to verify it's actually a creator
          const potentialCreator = await ctx.db.get(creatorData.id);
          if (!potentialCreator) {
            throw new Error(`Creator with id '${creatorData.id}' not found`);
          }
          // Verify this is actually from the creators table by checking if it has a name field
          const creatorRecord = await ctx.db
            .query("creators")
            .filter((q: any) => q.eq(q.field("_id"), creatorData.id))
            .first();
          if (!creatorRecord) {
            throw new Error(`ID '${creatorData.id}' does not belong to a creator`);
          }
          existingCreator = creatorRecord;
        } else {
          // Search by name
          existingCreator = await ctx.db
            .query("creators")
            .withIndex("by_name", (q: any) => q.eq("name", creatorData.name))
            .first();
        }

        let creator;
        let createdCount = 0;
        let updatedCount = 0;
        
        if (existingCreator) {
          // Update existing creator
          const updateData: any = {};
          for (const [key, value] of Object.entries(creatorData)) {
            if (key !== "name" && key !== "id" && key !== "channels" && value !== undefined) {
              updateData[key] = value;
            }
          }
          
          if (Object.keys(updateData).length > 0) {
            await ctx.db.patch(existingCreator._id, updateData);
            updatedCount++;
          }
          creator = existingCreator;
        } else {
          // Create new creator (only when using name, not id)
          if (hasId) {
            throw new Error(`Creator with id '${creatorData.id}' not found. Cannot create new creator using ID.`);
          }
          
          const newCreatorData: any = {};
          for (const [key, value] of Object.entries(creatorData)) {
            if (key !== "channels" && value !== undefined) {
              newCreatorData[key] = value;
            }
          }
          
          const creatorId = await ctx.db.insert("creators", newCreatorData);
          creator = await ctx.db.get(creatorId);
          createdCount++;
        }

        // Process channels if they exist
        if (creatorData.channels) {
          const channelResults = await processChannels(ctx, creator!._id, creatorData.channels);
          createdCount += channelResults.created;
          updatedCount += channelResults.updated;
        }
        
        results.push({
          name: creatorData.name || creator!.name,
          id: creatorData.id || creator!._id,
          success: true,
          creatorId: creator!._id,
          created: createdCount,
          updated: updatedCount,
        });
        
        totalCreated += createdCount;
        totalUpdated += updatedCount;
      } catch (error) {
        results.push({
          name: creatorData.name,
          id: creatorData.id,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
        totalErrors++;
      }
    }

    return {
      success: totalErrors === 0,
      total: args.creators.length,
      totalCreated,
      totalUpdated,
      totalErrors,
      results,
    };
  },
});

// HTTP Action for POST requests
export const createOrUpdateCreatorsHttp = httpAction(
  async (ctx, request) => {
    try {
      // Parse request body
      const body = await request.json();
      
      // Validation: body must be an array
      if (!Array.isArray(body)) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Request body must be an array of creators" 
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // Check limits
      if (body.length === 0) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Array of creators cannot be empty" 
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      if (body.length > 1000) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "Maximum number of creators per request: 1000" 
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // Minimal validation - check for either name or id field presence
      for (let i = 0; i < body.length; i++) {
        const creator = body[i];
        if (!creator || typeof creator !== "object") {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: `Creator at position ${i + 1} must be an object` 
            }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }
        
        // Check that either 'name' or 'id' is provided
        const hasName = creator.name && typeof creator.name === "string";
        const hasId = creator.id && typeof creator.id === "string";
        
        if (!hasName && !hasId) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: `Creator at position ${i + 1}: either 'name' or 'id' field is required and must be a string` 
            }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }
        
        // Don't allow both name and id at the same time to avoid confusion
        if (hasName && hasId) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: `Creator at position ${i + 1}: cannot specify both 'name' and 'id' fields. Use either 'name' for creation/update by name or 'id' for update by ID` 
            }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }
        
        // Validate ID format if provided
        if (hasId) {
          const idPattern = /^[a-z0-9]{32}$/;
          if (!idPattern.test(creator.id)) {
            return new Response(
              JSON.stringify({ 
                success: false, 
                error: `Creator at position ${i + 1}: invalid ID format. ID must be exactly 32 characters long and contain only lowercase letters and numbers` 
              }),
              { status: 400, headers: { "Content-Type": "application/json" } }
            );
          }
        }
      }

      // Remove duplicates by name or id - keep only first occurrence
      const uniqueCreators = [];
      const seenIdentifiers = new Set();
      
      for (const creator of body) {
        const identifier = creator.id || creator.name;
        if (!seenIdentifiers.has(identifier)) {
          seenIdentifiers.add(identifier);
          uniqueCreators.push(creator);
        }
      }

      // Process creators
      const result = await ctx.runMutation(
        internal.backend.creators.create_or_update_creators.batchUpsertCreators,
        { creators: uniqueCreators }
      );

      // Update the result to reflect the original total count
      const updatedResult = {
        ...result,
        total: body.length, // Original number of creators in request
        totalUnique: uniqueCreators.length, // Number of unique creators processed
      };

      return new Response(
        JSON.stringify(updatedResult),
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
          error: "Internal server error",
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
