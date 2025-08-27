import { httpAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

// Query to get user profile data
export const getUserProfileData = query({
  args: {
    userProfileId: v.id("userProfiles")
  },
  handler: async (ctx, args) => {
    const { userProfileId } = args;

    // Get user profile
    const userProfile = await ctx.db.get(userProfileId);
    if (!userProfile) {
      throw new Error("User profile not found");
    }

    // If there's a primary profile, get its data
    let primaryProfile = null;
    if (userProfile.primaryProfileId) {
      primaryProfile = await ctx.db.get(userProfile.primaryProfileId);
    }

    return {
      userProfile,
      primaryProfile
    };
  }
});

// Mutation to update userProfile with creator information
export const updateUserProfileWithCreator = mutation({
  args: {
    creatorId: v.optional(v.id("creators")),
    creatorName: v.optional(v.string()),
    userProfileId: v.id("userProfiles")
  },
  handler: async (ctx, args) => {
    const { creatorId, creatorName, userProfileId } = args;

    // Find creator by ID or name
    let creator;
    if (creatorId) {
      creator = await ctx.db.get(creatorId);
    } else if (creatorName) {
      creator = await ctx.db
        .query("creators")
        .withIndex("by_name", q => q.eq("name", creatorName))
        .first();
    }

    if (!creator) {
      throw new Error("Creator not found");
    }

    // Get current userProfile
    const userProfile = await ctx.db.get(userProfileId);
    if (!userProfile) {
      throw new Error("User profile not found");
    }

    // Create new profile entry
    const newProfile = {
      isActive: true,
      profileId: creator._id,
      profileType: "creator" as const
    };

    // Update userProfile with new creator information
    await ctx.db.patch(userProfileId, {
      primaryProfileId: creator._id,
      profiles: [newProfile]
    });

    return { success: true };
  }
});

// HTTP endpoint for onboarding
export const onboarding = httpAction(async (ctx, request) => {
  try {
    const body = await request.json();
    const { creator_id, creator_name, user_profile_id } = body;

    if (!user_profile_id) {
      return new Response(JSON.stringify({ 
        error: "user_profile_id is required" 
      }), {
        status: 400,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    if (!creator_id && !creator_name) {
      return new Response(JSON.stringify({ 
        error: "Either creator_id or creator_name is required" 
      }), {
        status: 400,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    const result = await ctx.runMutation(
      internal.backend.users_http.updateUserProfileWithCreator,
      {
        creatorId: creator_id,
        creatorName: creator_name,
        userProfileId: user_profile_id
      }
    );

    return new Response(JSON.stringify(result), {
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

// HTTP endpoint for getting user profile data
export const getUserProfile = httpAction(async (ctx, request) => {
  try {
    const url = new URL(request.url);
    const userProfileId = url.searchParams.get("user_profile_id");
    const fieldsParam = url.searchParams.get("fields");

    if (!userProfileId) {
      return new Response(JSON.stringify({ 
        error: "user_profile_id is required" 
      }), {
        status: 400,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    const result = await ctx.runQuery(
      internal.backend.users_http.getUserProfileData,
      {
        userProfileId
      }
    );

    // Если указан параметр fields, фильтруем ответ
    if (fieldsParam) {
      const fields = fieldsParam.split(',').map(field => field.trim());
      const filteredResult = filterFields(result, fields);
      
      return new Response(JSON.stringify(filteredResult), {
        status: 200,
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }

    return new Response(JSON.stringify(result), {
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

// Вспомогательная функция для фильтрации полей
function filterFields(data: any, fields: string[]): any {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => filterFields(item, fields));
  }

  const filtered: any = {};
  
  for (const field of fields) {
    if (field.includes('.')) {
      const [parentField, childField] = field.split('.');

      if (parentField === 'userProfile' || parentField === 'primaryProfile' || parentField === 'profiles') {
        if (data[parentField] && typeof data[parentField] === 'object') {
          if (!filtered[parentField]) {
            filtered[parentField] = {};
          }
          filtered[parentField][childField] = data[parentField][childField];
        }
      }
    } else {
      // Ищем поле на всех уровнях объекта
      if (data.hasOwnProperty(field)) {
        // Прямое поле в корне объекта
        filtered[field] = data[field];
      } else if (data.userProfile?.hasOwnProperty(field)) {
        // Поле в userProfile
        filtered[field] = data.userProfile[field];
      } else if (data.primaryProfile?.hasOwnProperty(field)) {
        // Поле в primaryProfile
        filtered[field] = data.primaryProfile[field];
      }
    }
  }

  return filtered;
}
