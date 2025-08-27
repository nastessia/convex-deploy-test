import { mutation } from "../../_generated/server";
import { query } from "../../_generated/server";
import { v } from "convex/values";
import { GenericActionCtx } from "convex/server";
import { DataModel } from "../../_generated/dataModel";
import { api } from "../../_generated/api";


export const createCategory = mutation({
  args: {
    categories: v.array(
      v.object({
        category: v.string(),
        description: v.optional(v.string())
      })
    )
  },
  handler: async (ctx, args) => {
    const categoryIds = [];
    for (const category of args.categories) {
      const existing = await ctx.db
        .query("categories")
        .filter(q => q.eq(q.field("category"), category.category))
        .first();
      
      if (existing) {
        throw new Error(`Category "${category.category}" already exists`);
      }
      
      const id = await ctx.db.insert("categories", category);
      categoryIds.push(id);
    }
    return categoryIds;
  }
});

export async function createCategoryHttp(ctx: GenericActionCtx<DataModel>, request: Request) {
  const body = await request.json();
  
  if (!Array.isArray(body.categories)) {
    return new Response(JSON.stringify({ error: "categories must be an array" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  for (const category of body.categories) {
    if (typeof category.category !== "string") {
      return new Response(JSON.stringify({ error: "each category must have a 'category' string field" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (category.description !== undefined && typeof category.description !== "string") {
      return new Response(JSON.stringify({ error: "description must be a string if provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
  }

  const result = await ctx.runMutation(api.backend.categories_http.createCategory, { categories: body.categories });
  
  return new Response(JSON.stringify({ categoryIds: result }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}

export const getAllCategories = query({
  handler: async (ctx) => {
    const categories = await ctx.db.query("categories").collect();
    return categories.map(({ category, description }) => ({
      category,
      description
    }));
  }
});

export async function getAllCategoriesHttp(ctx: GenericActionCtx<DataModel>, request: Request) {
  const categories = await ctx.runQuery(api.backend.categories_http.getAllCategories);
  
  return new Response(JSON.stringify({ categories }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}