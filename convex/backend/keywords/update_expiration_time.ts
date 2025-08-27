import { internal } from "../../_generated/api";
import { httpAction } from "../../_generated/server";
import { mutation } from "../../_generated/server";
import { v } from "convex/values";

export const updateKeywordExpirations = mutation({
    args: {
      keywords: v.array(
        v.object({
          keyword: v.string(),
          channels_for_last_run: v.optional(v.number()),
          expected_channels_for_task: v.optional(v.number())
        })
      )
    },
    handler: async (ctx, args) => {
      const newExpirationTimes = new Map();
      
      const keywords = await Promise.all(
        args.keywords.map(keywordData => 
          ctx.db
            .query("keywords")
            .withIndex("by_keyword")
            .filter(q => q.eq(q.field("keyword"), keywordData.keyword))
            .first()
        )
      );
  
      const validKeywords = keywords.filter((k): k is NonNullable<typeof k> => k !== null);
      
      const updates = validKeywords.map((keyword, index) => {
        const keywordData = args.keywords[index];
        const newExpirationTime = Date.now() + (keyword.update_period_days * 86400000);
        newExpirationTimes.set(keyword.keyword, newExpirationTime);
        
        const updateData: any = {
          expirations_time: newExpirationTime,
          last_run: Date.now()
        };
  
        if (keywordData.channels_for_last_run !== undefined) {
          updateData.channels_for_last_run = keywordData.channels_for_last_run;
        }
  
        if (keywordData.expected_channels_for_task !== undefined) {
          updateData.expected_channels_for_task = keywordData.expected_channels_for_task;
        }
  
        return ctx.db.patch(keyword._id, updateData);
      });
  
      await Promise.all(updates);
  
      return args.keywords.map(keywordData => ({
        keyword: keywordData.keyword,
        updated: newExpirationTimes.has(keywordData.keyword)
      }));
    }
  });
  
  export const updateKeywordExpirationsHttp = httpAction(async (ctx, request) => {
    try {
      const keywords = await request.json();
  
      if (!Array.isArray(keywords)) {
        return new Response(JSON.stringify({ 
          error: "Request body must be an array" 
        }), {
          status: 400,
          headers: { 
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
  
      const results = await ctx.runMutation(
        internal.backend.keywords.update_expiration_time.updateKeywordExpirations,
        { keywords }
      );
  
      return new Response(JSON.stringify(results), {
        status: 200,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    } catch (error) {
      return new Response(JSON.stringify({ 
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error)
      }), {
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
  });