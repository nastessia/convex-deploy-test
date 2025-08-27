import { internal } from "../../_generated/api";
import { httpAction } from "../../_generated/server";
import { query } from "../../_generated/server";
import { v } from "convex/values";

// Helper function to process fields filter
async function processFieldsFilter(ctx: any, keywordId: any, fieldsParam: string, baseResult: any) {
  const requestedFields = fieldsParam.split(',').map(field => field.trim());
  const filteredResult: any = {};
  
  
  for (const field of requestedFields) {
    // Check if it's a regular keyword field
    if (field in baseResult) {
      filteredResult[field] = baseResult[field];
      continue;
    }
  }
  
  return filteredResult;
}

export const getKeyword = query({
  args: {
    id: v.optional(v.id("keywords")),
    keyword: v.optional(v.string()),

    fields: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let channel = null;

    // Search by twitch ID
    if (args.id) {
      channel = await ctx.db.get(args.id);
    }
    // Search by keyword
    else if (args.keyword) {
      channel = await ctx.db
        .query("keywords")
        .filter((q) => q.eq(q.field("keyword"), args.keyword))
        .first();
    }

    if (!channel) {
      return null;
    }

    let result: any = channel;

    // If fields parameter is specified, return only requested fields
    if (args.fields) {
      return await processFieldsFilter(ctx, channel._id, args.fields, result);
    }

    return result;
  },
});


export const getKeywordHttp = httpAction(
  async (ctx, request) => {
    try {
      const url = new URL(request.url);
      const searchParams = url.searchParams;

      // Extract search parameters
      const id = searchParams.get("id");
      const keyword = searchParams.get("keyword");

      const fields = searchParams.get("fields");

      // Check that at least one search parameter is provided
      if (!id && !keyword) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: "At least one search parameter is required (id, keyword)" 
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const result = await ctx.runQuery(internal.backend.keywords.get_keyword.getKeyword, {
        id: id ? id as any : undefined,
        keyword: keyword ? keyword as any : undefined,
        fields: fields || undefined,
      });

      if (!result) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Keyword not found",
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
          error: "Failed to fetch Keyword",
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
