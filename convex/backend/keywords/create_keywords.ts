import { internalMutation } from "../../_generated/server";
import { httpAction } from "../../_generated/server";
import { internal } from "../../_generated/api";
import { v } from "convex/values";

// Mutation for creating multiple keywords
export const createKeywords = internalMutation({
  args: {
    keywords: v.array(v.object({
      keyword: v.string(),
      update_period_days: v.optional(v.number()),
      expirations_time: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const results = [];
    const failedKeywords = [];
    
    for (const keywordInput of args.keywords) {
      // check if keyword already exists
      const existingKeyword = await ctx.db
        .query("keywords")
        .withIndex("by_keyword", (q) => q.eq("keyword", keywordInput.keyword))
        .first();
      
      if (existingKeyword) {
        // keyword already exists, add to failed keywords
        failedKeywords.push({
          keyword: keywordInput.keyword,
          reason: "Keyword already exists"
        });
        continue;
      }
      
      const keywordData = {
        keyword: keywordInput.keyword,
        expirations_time: keywordInput.expirations_time ?? now,
        update_period_days: keywordInput.update_period_days ?? 7,
      };

      const _id = await ctx.db.insert("keywords", keywordData);
      
      results.push({
        data: {
          ...keywordData,
          _id,
        },
      });
    }
    
    return {
      created: results.length,
      failed: failedKeywords.length,
      keywords: results,
      failed_keywords: failedKeywords,
    };
  },
});

// HTTP endpoint for POST request to create keywords
export const createKeywordHttp = httpAction(
  async (ctx, request) => {
    try {
      const body = await request.json();
      
      // Validation of required keywords array
      if (!body.keywords || !Array.isArray(body.keywords) || body.keywords.length === 0) {
        return new Response(
          JSON.stringify({ 
            error: "Field 'keywords' is required and must be a non-empty array" 
          }),
          { 
            status: 400, 
            headers: { "Content-Type": "application/json" } 
          }
        );
      }

      // Validate each keyword object
      for (let i = 0; i < body.keywords.length; i++) {
        const keywordObj = body.keywords[i];
        
        // Check if keyword is an object
        if (typeof keywordObj !== 'object' || keywordObj === null) {
          return new Response(
            JSON.stringify({ 
              error: `Keyword at index ${i} must be an object` 
            }),
            { 
              status: 400, 
              headers: { "Content-Type": "application/json" } 
            }
          );
        }

        // Validate required keyword field
        if (!keywordObj.keyword || typeof keywordObj.keyword !== "string" || keywordObj.keyword.trim() === "") {
          return new Response(
            JSON.stringify({ 
              error: `Field 'keyword' at index ${i} is required and must be a non-empty string` 
            }),
            { 
              status: 400, 
              headers: { "Content-Type": "application/json" } 
            }
          );
        }

        // Validation of update_period_days if provided
        if (keywordObj.update_period_days !== undefined && 
            (typeof keywordObj.update_period_days !== "number" || keywordObj.update_period_days <= 0)) {
          return new Response(
            JSON.stringify({ 
              error: `Field 'update_period_days' at index ${i} must be a positive number` 
            }),
            { 
              status: 400, 
              headers: { "Content-Type": "application/json" } 
            }
          );
        }

        // Validation of expirations_time if provided (must be a valid unix timestamp)
        if (keywordObj.expirations_time !== undefined && 
            (typeof keywordObj.expirations_time !== "number" || keywordObj.expirations_time <= 0)) {
          return new Response(
            JSON.stringify({ 
              error: `Field 'expirations_time' at index ${i} must be a positive unix timestamp number` 
            }),
            { 
              status: 400, 
              headers: { "Content-Type": "application/json" } 
            }
          );
        }

        // Trim keyword string
        keywordObj.keyword = keywordObj.keyword.trim();
      }

      const result = await ctx.runMutation(internal.backend.keywords.create_keywords.createKeywords, {
        keywords: body.keywords,
      });

      return new Response(
        JSON.stringify(result),
        {
          status: 201,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: "Failed to create keywords",
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