import { internal } from "../../_generated/api";
import { httpAction } from "../../_generated/server";
import { query } from "../../_generated/server";
import { v } from "convex/values";
import { TWITCH_FILTER_CONFIG, parseFilters, applyFilters } from "./filters";

// Pagination validator
const paginationOptsValidator = v.object({
  offset: v.number(),
  limit: v.number(),
});

export const getTwitchChannels = query({
  args: {
    paginationOpts: paginationOptsValidator,
    sortOrder: v.optional(v.string()),
    sortField: v.optional(v.string()),
    filters: v.any(),
  },
  handler: async (ctx, args) => {
    let dbQuery = ctx.db.query("twitch_channels");
    
    // Apply filters dynamically
    if (args.filters) {
      dbQuery = applyFilters(dbQuery, args.filters);
    }
    
    // Sorting
    const sortOrder = args.sortOrder === "asc" ? "asc" : "desc";
    const orderedQuery = dbQuery.order(sortOrder);
    
    // Pagination
    const result = await orderedQuery.paginate({
      cursor: null,
      numItems: args.paginationOpts.limit,
    });

    return result;
  },
});


export const getTwitchChannelsHttp = httpAction(
  async (ctx, request) => {
    try {
      const url = new URL(request.url);
      const searchParams = url.searchParams;

      // Pagination
      const page = parseInt(searchParams.get("page") || "1");
      const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
      const offset = (page - 1) * limit;

      // Parse filters dynamically
      const filters = parseFilters(searchParams, TWITCH_FILTER_CONFIG);

      // Sorting
      const sortField = searchParams.get("sort") || "_creationTime";
      const sortOrder = searchParams.get("order") || "desc";

      // Validation of sort field
      if (!TWITCH_FILTER_CONFIG.sortable.includes(sortField)) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Invalid sort field: ${sortField}. Allowed: ${TWITCH_FILTER_CONFIG.sortable.join(', ')}` 
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const result = await ctx.runQuery(internal.backend.twitch.get_twitch_channels.getTwitchChannels, {
        paginationOpts: { offset, limit },
        filters,
        sortField,
        sortOrder,
      });

      // Count total number of creators
      const totalCount = await ctx.runQuery(internal.backend.twitch.get_twitch_channels.getTwitchChannelsCount, {
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
export const getTwitchChannelsCount = query({
  args: {
    filters: v.any(),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("twitch_channels");
    
    if (args.filters) {
      query = applyFilters(query, args.filters);
    }
    
    const results = await query.collect();
    return results.length;
  },
});