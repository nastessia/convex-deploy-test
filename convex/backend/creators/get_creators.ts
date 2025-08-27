import { internal } from "../../_generated/api";
import { httpAction } from "../../_generated/server";
import { query } from "../../_generated/server";
import { v } from "convex/values";
import { CREATOR_FILTER_CONFIG, parseFilters, applyFilters } from "./filters";
import { applySearchFilters } from "../common/filters";
import { applyFilters as applyYoutubeFilters } from "../youtube/filters";
import { applyFilters as applyTwitchFilters } from "../twitch/filters";
import { applyFilters as applyInstagramFilters } from "../instagram/filters";
import { applyFilters as applyTiktokFilters } from "../tiktok/filters";
import { applyFilters as applyFacebookFilters } from "../facebook/filters";
import { applyFilters as applyXFilters } from "../x/filters";

// Pagination validator
const paginationOptsValidator = v.object({
  offset: v.number(),
  limit: v.number(),
});

export const getCreators = query({
  args: {
    paginationOpts: paginationOptsValidator,
    sortOrder: v.optional(v.string()),
    sortField: v.optional(v.string()),
    filters: v.any(),
    full: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Apply social network filters first (cross-table filtering)
    let socialNetworkCreatorIds: string[] | null = null;
    if (args.filters?.socialNetworks) {
      socialNetworkCreatorIds = [];
      
      // Map of network names to their query functions and filters
      const networkConfig = {
        youtube: { tableName: "youtube_channels", applyFilters: applyYoutubeFilters },
        twitch: { tableName: "twitch_channels", applyFilters: applyTwitchFilters },
        instagram: { tableName: "instagram_channels", applyFilters: applyInstagramFilters },
        tiktok: { tableName: "tiktok_channels", applyFilters: applyTiktokFilters },
        facebook: { tableName: "facebook_channels", applyFilters: applyFacebookFilters },
        x: { tableName: "x_channels", applyFilters: applyXFilters }
      };
      
      for (const [networkName, networkFilters] of Object.entries(args.filters.socialNetworks)) {
        const config = networkConfig[networkName as keyof typeof networkConfig];
        if (config) {
          // Query channels with filters
          let channelQuery = ctx.db.query(config.tableName as any);
          channelQuery = config.applyFilters(channelQuery, networkFilters as any);
          let channels = await channelQuery.collect();
          
          // Apply search filters (substring matching) after data retrieval
          const typedFilters = networkFilters as any;
          if (typedFilters.search && Object.keys(typedFilters.search).length > 0) {
            channels = applySearchFilters(channels, typedFilters.search);
          }
          
          // Extract creator_ids as Id<"creators">
          const networkCreatorIds = channels.map(channel => channel.creator_id as any);
          
          // Intersect with existing creator_ids if we already have some from other networks
          if (socialNetworkCreatorIds.length === 0) {
            socialNetworkCreatorIds = networkCreatorIds;
          } else {
            socialNetworkCreatorIds = socialNetworkCreatorIds.filter(id => networkCreatorIds.includes(id));
          }
        }
      }
      
      // If we have social network filters but no matching creators, return empty result
      if (socialNetworkCreatorIds.length === 0) {
        return {
          page: [],
          isDone: true,
          continueCursor: null,
        };
      }
      
    }
    
    // Optimized sorting using Convex indexes - must be applied before filters
    const sortOrder = args.sortOrder === "asc" ? "asc" : "desc";
    const sortField = args.sortField || "_creationTime";
    
    // Start with the appropriate index for sorting
    let sortedQuery;
    if (sortField === "name") {
      sortedQuery = ctx.db.query("creators").withIndex("by_name").order(sortOrder);
    } else if (sortField === "_creationTime") {
      sortedQuery = ctx.db.query("creators").order(sortOrder); // Default order by _creationTime
    } else {
      // For other fields, use default sorting
      sortedQuery = ctx.db.query("creators").order(sortOrder);
    }
    
    // Apply social network filters first (cross-table filtering)
    if (socialNetworkCreatorIds !== null) {
      sortedQuery = sortedQuery.filter((q) => {
        const conditions = socialNetworkCreatorIds!.map(creatorId => 
          q.eq(q.field("_id"), creatorId)
        );
        return q.or(...conditions);
      });
    }
    
    // Apply other filters dynamically (excluding social networks and search)
    if (args.filters) {
      const filtersWithoutSocialAndSearch = { ...args.filters };
      delete filtersWithoutSocialAndSearch.socialNetworks;
      delete filtersWithoutSocialAndSearch.search;
      sortedQuery = applyFilters(sortedQuery, filtersWithoutSocialAndSearch);
    }
    
    let finalResult;
    
    // Check if we have search filters that require post-processing
    const hasSearchFilters = args.filters?.search && Object.keys(args.filters.search).length > 0;
    
    if (hasSearchFilters) {
      // For search filters, we need to get all data and filter manually
      const allData = await sortedQuery.collect();
      
      // Apply search filters
      const filteredData = applySearchFilters(allData, args.filters.search);
      
      // Apply manual sorting if not using indexed field
      let sortedData = filteredData;
      if (sortField !== "name" && sortField !== "_creationTime") {
        sortedData = filteredData.sort((a, b) => {
          const aValue = (a as any)[sortField];
          const bValue = (b as any)[sortField];
          
          // Handle string comparison
          if (typeof aValue === 'string' && typeof bValue === 'string') {
            const comparison = aValue.localeCompare(bValue);
            return sortOrder === "asc" ? comparison : -comparison;
          }
          
          // Handle numeric comparison
          if (typeof aValue === 'number' && typeof bValue === 'number') {
            return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
          }
          
          return 0;
        });
      }
      
      // Manual pagination
      const offset = args.paginationOpts.offset;
      const limit = args.paginationOpts.limit;
      const page = sortedData.slice(offset, offset + limit);
      const isDone = offset + limit >= sortedData.length;
      
      finalResult = {
        page,
        isDone,
        continueCursor: null,
      };
    } else {
      // Optimized path: use efficient pagination
      finalResult = await sortedQuery.paginate({
        cursor: null,
        numItems: args.paginationOpts.limit,
      });
    }

    // If full=true, load social networks for each creator
    if (args.full) {
      const creatorsWithSocials = await Promise.all(
        finalResult.page.map(async (creator: any) => {
          const [youtube, instagram, tiktok, twitch, facebook, x] = await Promise.all([
            ctx.db.query("youtube_channels").withIndex("by_creator_id", q => q.eq("creator_id", creator._id)).collect(),
            ctx.db.query("instagram_channels").withIndex("by_creator_id", q => q.eq("creator_id", creator._id)).collect(),
            ctx.db.query("tiktok_channels").withIndex("by_creator_id", q => q.eq("creator_id", creator._id)).collect(),
            ctx.db.query("twitch_channels").withIndex("by_creator_id", q => q.eq("creator_id", creator._id)).collect(),
            ctx.db.query("facebook_channels").withIndex("by_creator_id", q => q.eq("creator_id", creator._id)).collect(),
            ctx.db.query("x_channels").withIndex("by_creator_id", q => q.eq("creator_id", creator._id)).collect(),
          ]);

          return {
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
        })
      );

      return {
        ...finalResult,
        page: creatorsWithSocials
      };
    }

    return finalResult;
  },
});


export const getCreatorsHttp = httpAction(
  async (ctx, request) => {
    try {
      const url = new URL(request.url);
      const searchParams = url.searchParams;

      // Pagination
      const page = parseInt(searchParams.get("page") || "1");
      const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
      const offset = (page - 1) * limit;

      // Parse filters dynamically
      const filters = parseFilters(searchParams, CREATOR_FILTER_CONFIG);

      // Sorting
      const sortField = searchParams.get("sort") || "_creationTime";
      const sortOrder = searchParams.get("order") || "desc";

      // Full parameter
      const full = searchParams.get("full") === "true";

      // Validation of sort field
      if (!CREATOR_FILTER_CONFIG.sortable.includes(sortField)) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Invalid sort field: ${sortField}. Allowed: ${CREATOR_FILTER_CONFIG.sortable.join(', ')}` 
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const result = await ctx.runQuery(internal.backend.creators.get_creators.getCreators, {
        paginationOpts: { offset, limit },
        filters,
        sortField,
        sortOrder,
        full,
      });

      // Count total number of creators
      const totalCount = await ctx.runQuery(internal.backend.creators.get_creators.getCreatorsCount, {
        filters,
      });

      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      return new Response(
        JSON.stringify({
          success: true,
          data: result.page,
          pagination: {
            currentPage: page,
            totalPages,
            totalCount,
            limit,
            hasNextPage,
            hasPrevPage,
            nextPage: hasNextPage ? page + 1 : null,
            prevPage: hasPrevPage ? page - 1 : null,
          },
          appliedFilters: filters,
          sort: { field: sortField, order: sortOrder },
          full,
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
          error: "Failed to fetch creators",
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

// Count function with the same filters
export const getCreatorsCount = query({
  args: {
    filters: v.any(),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("creators");
    
    // Apply social network filters first (cross-table filtering)
    let socialNetworkCreatorIds: string[] | null = null;
    if (args.filters?.socialNetworks) {
      socialNetworkCreatorIds = [];
      
      // Map of network names to their query functions and filters
      const networkConfig = {
        youtube: { tableName: "youtube_channels", applyFilters: applyYoutubeFilters },
        twitch: { tableName: "twitch_channels", applyFilters: applyTwitchFilters },
        instagram: { tableName: "instagram_channels", applyFilters: applyInstagramFilters },
        tiktok: { tableName: "tiktok_channels", applyFilters: applyTiktokFilters },
        facebook: { tableName: "facebook_channels", applyFilters: applyFacebookFilters },
        x: { tableName: "x_channels", applyFilters: applyXFilters }
      };
      
      for (const [networkName, networkFilters] of Object.entries(args.filters.socialNetworks)) {
        const config = networkConfig[networkName as keyof typeof networkConfig];
        if (config) {
          // Query channels with filters
          let channelQuery = ctx.db.query(config.tableName as any);
          channelQuery = config.applyFilters(channelQuery, networkFilters as any);
          let channels = await channelQuery.collect();
          
          // Apply search filters (substring matching) after data retrieval
          const typedFilters = networkFilters as any;
          if (typedFilters.search && Object.keys(typedFilters.search).length > 0) {
            channels = applySearchFilters(channels, typedFilters.search);
          }
          
          // Extract creator_ids as Id<"creators">
          const networkCreatorIds = channels.map(channel => channel.creator_id as any);
          
          // Intersect with existing creator_ids if we already have some from other networks
          if (socialNetworkCreatorIds.length === 0) {
            socialNetworkCreatorIds = networkCreatorIds;
          } else {
            socialNetworkCreatorIds = socialNetworkCreatorIds.filter(id => networkCreatorIds.includes(id));
          }
        }
      }
      
      // If we have social network filters but no matching creators, return 0
      if (socialNetworkCreatorIds.length === 0) {
        return 0;
      }
      
      // Filter creators by the collected creator_ids
      query = query.filter((q) => {
        const conditions = socialNetworkCreatorIds!.map(creatorId => 
          q.eq(q.field("_id"), creatorId)
        );
        return q.or(...conditions);
      });
    }
    
    // Apply other filters dynamically (excluding social networks)
    if (args.filters) {
      const filtersWithoutSocial = { ...args.filters };
      delete filtersWithoutSocial.socialNetworks;
      query = applyFilters(query, filtersWithoutSocial);
    }
    
    let results = await query.collect();
    
    // Apply search filters if present
    if (args.filters?.search && Object.keys(args.filters.search).length > 0) {
      results = applySearchFilters(results, args.filters.search);
    }
    
    return results.length;
  },
});