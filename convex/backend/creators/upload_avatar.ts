import { httpAction } from "../../_generated/server";
import { mutation } from "../../_generated/server";
import { query } from "../../_generated/server";
import { internal } from "../../_generated/api";
import { v } from "convex/values";


export const uploadCreatorAvatarMutation = mutation({
    args: {
      creatorId: v.id("creators"),
      storageId: v.string(),
    },
    handler: async (ctx, args) => {
      const fileUrl = await ctx.storage.getUrl(args.storageId);
      
      if (!fileUrl) {
        throw new Error("Failed to get file URL from storage");
      }
  
      await ctx.db.patch(args.creatorId, {
        avatar: {
          image: fileUrl,
          fallback: "",
        },
      });
      return true;
    },
  });
  
  // Query functions for finding creators
  export const getCreatorByName = query({
    args: { name: v.string() },
    handler: async (ctx, args) => {
      return await ctx.db
        .query("creators")
        .withIndex("by_name", (q) => q.eq("name", args.name))
        .first();
    },
  });

  export const getCreatorById = query({
    args: { id: v.id("creators") },
    handler: async (ctx, args) => {
      return await ctx.db.get(args.id);
    },
  });
  
  export const uploadCreatorAvatar = httpAction(async (ctx, request) => {
    try {
      // Check Content-Type
      const contentType = request.headers.get("Content-Type");
      if (contentType !== "application/json") {
        return new Response(
          JSON.stringify({
            error: "Content-Type must be application/json",
          }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
      }
  
      // Парсим JSON из тела запроса
      const body = await request.json();
      const { name, creatorId, fileUrl } = body;
  
      if ((!name && !creatorId) || !fileUrl) {
        return new Response(
          JSON.stringify({
            error: "Either name or creatorId, and fileUrl are required",
          }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
      }
  
      // Validate URL
      try {
        new URL(fileUrl);
      } catch (e) {
        return new Response(
          JSON.stringify({
            error: "Invalid fileUrl provided",
          }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
      }
  
      // Find creator by name or ID
      let creator;
      if (creatorId) {
        // Search by ID using query
        creator = await ctx.runQuery(internal.backend.creators.upload_avatar.getCreatorById, {
          id: creatorId,
        });
      } else if (name) {
        // Search by name using query
        creator = await ctx.runQuery(internal.backend.creators.upload_avatar.getCreatorByName, {
          name,
        });
      }
  
      if (!creator) {
        return new Response(
          JSON.stringify({
            error: creatorId
              ? `Creator with ID "${creatorId}" not found`
              : `Creator with name "${name}" not found`,
          }),
          {
            status: 404,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
      }
  
      // Download file from URL
      const response = await fetch(fileUrl);
      if (!response.ok) {
        return new Response(
          JSON.stringify({
            error: "Failed to download file from URL",
          }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
      }
  
      // Get file content type
      const fileContentType = response.headers.get("Content-Type");
      if (!fileContentType || !fileContentType.startsWith("image/")) {
        return new Response(
          JSON.stringify({
            error: "URL must point to an image file",
          }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
      }
  
      // Get file as blob
      const fileBlob = await response.blob();
  
      // Upload file to storage
      const storageId = await ctx.storage.store(fileBlob);
  
      // Get the full URL for the uploaded file
      const storageFileUrl = await ctx.storage.getUrl(storageId);
  
      // Update creator with avatar information using mutation
      await ctx.runMutation(internal.backend.creators.upload_avatar.updateCreatorAvatar, {
        creatorId: creator._id,
        avatar: {
          image: storageFileUrl,
          fallback: "",
        },
      });
  
      return new Response(
        JSON.stringify({
          success: true,
          avatar_url: storageFileUrl,
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
      console.error("Avatar upload error:", error);
      return new Response(
        JSON.stringify({
          error: "Internal server error",
          details: error instanceof Error ? error.message : String(error),
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  });
  
  // Add this mutation function
  export const updateCreatorAvatar = mutation({
    args: {
      creatorId: v.id("creators"),
      avatar: v.object({
        image: v.string(),
        fallback: v.string(),
      }),
    },
    handler: async (ctx, args) => {
      await ctx.db.patch(args.creatorId, {
        avatar: args.avatar,
      });
      return true;
    },
  });