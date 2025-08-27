import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  campaignTasks: defineTable({
    campaignId: v.id("campaigns"),
    brandId: v.id("brands"),
    brandName: v.optional(v.string()),
    brandUserId: v.string(), // Clerk User ID
    creatorId: v.id("creators"),
    creatorUserId: v.string(), // Clerk User ID
    creatorName: v.optional(v.string()),
    name: v.string(),
    taskTitle: v.string(),
    customMessage: v.optional(v.string()),
    dueDate: v.string(),
    status: v.union(
      v.literal("invited"),
      v.literal("accepted"),
      v.literal("work_started"),
      v.literal("submitting_results"),
      v.literal("review"),
      v.literal("revision"),
      v.literal("confirmation"),
      v.literal("completed"),
      v.literal("rejected")
    ),
    progress: v.number(),
    budget: v.number(),
    currency: v.string(),
    shortDescription: v.string(),
    longDescription: v.string(),
    category: v.string(),
    language: v.string(),
    country: v.string(),
    socialPlatform: v.string(),
    targetAudience: v.string(),
    keyObjectives: v.string(),
    guidelines: v.string(),
    resources: v.string(),
    brandAccepted: v.boolean(),
    creatorAccepted: v.boolean(),
    brandAcceptedAt: v.optional(v.string()),
    creatorAcceptedAt: v.optional(v.string()),
    activityLog: v.optional(
      v.array(
        v.object({
          id: v.string(),
          timestamp: v.number(),
          action: v.string(),
          user: v.string(),
          userType: v.union(v.literal("brand"), v.literal("creator")),
          details: v.optional(v.string()),
        })
      )
    ),
    lastActionBy: v.optional(v.string()),
    lastActionAt: v.optional(v.number()),
    creatorSubmission: v.optional(
      v.object({
        details: v.string(),
        url: v.string(),
        submittedAt: v.string(),
      })
    ),
    feedbackHistory: v.optional(
      v.array(
        v.object({
          id: v.string(),
          from: v.union(v.literal("Brand"), v.literal("Creator")),
          message: v.string(),
          timestamp: v.string(),
        })
      )
    ),
    rejectedBy: v.optional(v.union(v.literal("Brand"), v.literal("Creator"))),
    rejectedAt: v.optional(v.string()),
    rejectionReason: v.optional(v.string()),
    paymentStatus: v.union(
      v.literal("pending"),
      v.literal("payment_required"),
      v.literal("payment_held"),
      v.literal("payment_released"),
      v.literal("payment_failed")
    ),
    stripePaymentIntentId: v.optional(v.string()),
    stripeTransferId: v.optional(v.string()),
    paymentHeldAt: v.optional(v.string()),
    paymentReleasedAt: v.optional(v.string()),
    paymentFailedAt: v.optional(v.string()),
    paymentFailureReason: v.optional(v.string()),
    keyMessages: v.optional(v.array(v.string())),
    hashtags: v.optional(v.array(v.string())),
    performanceMetrics: v.optional(
      v.object({
        engagement: v.array(v.string()),
        conversions: v.array(v.string()),
        impressions: v.array(v.string()),
        otherMetrics: v.array(v.string()),
      })
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_campaign", ["campaignId"])
    .index("by_brand", ["brandId"])
    .index("by_creator", ["creatorId"])
    .index("by_status", ["status"])
    .index("by_payment_status", ["paymentStatus"])
    .index("by_brand_status", ["brandId", "status"])
    .index("by_creator_status", ["creatorId", "status"])
    .index("by_campaign_status", ["campaignId", "status"]),
  creators: defineTable({
    name: v.string(),
    creationTime: v.optional(v.number()),
    category: v.optional(v.array(v.string())),
    country: v.optional(v.array(v.string())),
    label: v.optional(v.array(v.string())),
    language: v.optional(v.array(v.string())),
    contacts: v.optional(v.array(v.string())),
    visibility: v.optional(v.boolean()),
    production: v.optional(v.boolean()),
    description_short: v.optional(v.string()),
    description_long: v.optional(v.string()),
    full_name: v.optional(v.string()),
    gender: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    currency: v.optional(v.string()),
    avg_price: v.optional(v.number()),
    avatar: v.optional(
      v.object({
        image: v.string(),
        fallback: v.string(),
      })
    ),
    media: v.optional(
      v.array(
        v.object({
          type: v.union(v.literal("youtube"), v.literal("image")),
          url: v.string(),
          thumbnail: v.optional(v.string()),
        })
      )
    ),
    audienceDemographics: v.optional(
      v.object({
        ageRanges: v.array(
          v.object({
            range: v.string(),
            percentage: v.number(),
          })
        ),
        gender: v.array(
          v.object({
            type: v.string(),
            percentage: v.number(),
          })
        ),
        location: v.optional(
          v.array(
            v.object({
              type: v.string(),
              percentage: v.number(),
            })
          )
        ),
      })
    ),
    contentPerformance: v.optional(
      v.object({
        avgEngagementRate: v.number(),
        avgReachPerPost: v.number(),
      })
    ),
    campaignHistory: v.optional(
      v.array(
        v.object({
          name: v.string(),
          date: v.string(),
          type: v.string(),
        })
      )
    ),
    socialStats: v.optional(
      v.object({
        instagram: v.optional(v.number()),
        youtube: v.optional(v.number()),
        twitter: v.optional(v.number()),
        facebook: v.optional(v.number()),
        tiktok: v.optional(v.number()),
        twitch: v.optional(v.number()),
        lastUpdated: v.optional(v.number()),
      })
    ),
    descriptionEmbedding: v.optional(v.array(v.float64())),
    contentTags: v.optional(v.array(v.string())),
    performanceMetrics: v.optional(
      v.object({
        completionRate: v.optional(v.number()),
        conversionRate: v.optional(v.number()),
        engagementRate: v.optional(v.number()),
        responseTime: v.optional(v.number()),
        lastUpdated: v.optional(v.number()),
      })
    ),
    ribbons: v.optional(v.array(v.string())),
    verified: v.optional(v.boolean()),
  })
    .index("by_name", ["name"])
    .index("by_contacts", ["contacts"])
    .index("by_category", ["category"])
    .index("by_country", ["country"])
    .index("by_label", ["label"])
    .index("by_visibility", ["visibility"])
    .index("by_production", ["production"])
    .index("by_language", ["language"])
    .index("by_creation", ["creationTime"])
    .searchIndex("search_category", {
      searchField: "category",
      filterFields: ["visibility"],
    })
    .searchIndex("search_creators", {
      searchField: "name",
      filterFields: ["visibility", "category"],
    })
    .index("by_platform_stats", ["socialStats", "visibility"])
    .searchIndex("search_content_tags", {
      searchField: "contentTags",
      filterFields: ["visibility"],
    })
    .vectorIndex("by_description_embedding", {
      vectorField: "descriptionEmbedding",
      dimensions: 1536,
    }),

  youtube_channels: defineTable({
    creator_id: v.id("creators"),
    channel_id: v.string(),
    title: v.optional(v.string()),
    username: v.optional(v.string()),
    url: v.optional(v.string()),
    subscribers: v.optional(v.number()),
    engagement_rate: v.optional(v.number()),
    is_active: v.optional(v.boolean()),
    is_empty: v.optional(v.boolean()),
    not_found: v.optional(v.boolean()),
    is_verified: v.optional(v.boolean()),
    to_be_updated: v.optional(v.boolean()),
    joined_at: v.optional(v.string()),
    last_refresh: v.optional(v.string()),
    picture_url: v.optional(v.string()),
    location: v.optional(v.array(v.string())),
    primary: v.optional(v.boolean()),
    processed: v.optional(v.boolean()),
    videos_count: v.optional(v.number()),
    views: v.optional(v.number()),
    average_comments: v.optional(v.number()),
    average_likes: v.optional(v.number()),
    average_viewers: v.optional(v.number()),
    median_comments: v.optional(v.number()),
    median_likes: v.optional(v.number()),
    median_viewers: v.optional(v.number()),
    frequency: v.optional(v.string()),
  })
    .index("by_creator_id", ["creator_id"])
    .index("by_channel", ["channel_id"])
    .index("by_processed", ["processed"])
    .index("by_last_refresh", ["last_refresh"])
    .index("by_to_be_updated", ["to_be_updated"]),

  twitch_channels: defineTable({
    creator_id: v.id("creators"),
    channel_id: v.optional(v.string()),
    url: v.optional(v.string()),
    followers: v.optional(v.number()),
    engagement_rate: v.optional(v.number()),
    username: v.optional(v.string()),
    primary: v.optional(v.boolean()),
    processed: v.optional(v.boolean()),
    to_be_updated: v.optional(v.boolean()),
    language: v.optional(v.string()),
    last_refresh: v.optional(v.string()),
    is_active: v.optional(v.boolean()),
    not_found: v.optional(v.boolean()),
    average_stream_length: v.optional(v.number()),
    average_viewers: v.optional(v.number()),
    average_watch_time: v.optional(v.number()),
    median_stream_length: v.optional(v.number()),
    median_viewers: v.optional(v.number()),
    median_watch_time: v.optional(v.number()),
    peak_viewers: v.optional(v.number()),
  })
    .index("by_creator_id", ["creator_id"])
    .index("by_channel", ["channel_id"])
    .index("by_processed", ["processed"])
    .index("by_to_be_updated", ["to_be_updated"])
    .index("by_last_refresh", ["last_refresh"]),

  keywords: defineTable({
    category: v.optional(v.array(v.string())),
    country: v.optional(v.array(v.string())),
    expirations_time: v.number(),
    keyword: v.string(),
    label: v.optional(v.array(v.string())),
    language: v.optional(v.array(v.string())),
    last_run: v.optional(v.number()),
    channels_for_last_run: v.optional(v.number()),
    expected_channels_for_task: v.optional(v.number()),
    update_period_days: v.number(),
  })
    .index("by_keyword", ["keyword"])
    .index("by_category", ["category"])
    .index("by_country", ["country"])
    .index("by_label", ["label"])
    .index("by_language", ["language"])
    .index("by_expirations_time", ["expirations_time"]),

  instagram_channels: defineTable({
    creator_id: v.id("creators"),
    url: v.optional(v.string()),
    channel_id: v.string(),
    followers: v.optional(v.number()),
    engagement_rate: v.optional(v.number()),
    username: v.optional(v.string()),
    primary: v.optional(v.boolean()),
    processed: v.optional(v.boolean()),
    to_be_updated: v.optional(v.boolean()),
    last_refresh: v.optional(v.string()),
    is_active: v.optional(v.boolean()),
    not_found: v.optional(v.boolean()),
    average_likes: v.optional(v.number()),
    average_comments: v.optional(v.number()),
    posts_per_week: v.optional(v.number()),
  })
    .index("by_creator_id", ["creator_id"])
    .index("by_channel", ["channel_id"])
    .index("by_processed", ["processed"])
    .index("by_to_be_updated", ["to_be_updated"])
    .index("by_last_refresh", ["last_refresh"]),

  tiktok_channels: defineTable({
    creator_id: v.id("creators"),
    url: v.optional(v.string()),
    channel_id: v.string(),
    processed: v.optional(v.boolean()),
    last_refresh: v.optional(v.string()),
    is_active: v.optional(v.boolean()),
    is_empty: v.optional(v.boolean()),
    not_found: v.optional(v.boolean()),
    to_be_updated: v.optional(v.boolean()),
    followers: v.optional(v.number()),
    engagement_rate: v.optional(v.number()),
    username: v.optional(v.string()),
    likes: v.optional(v.number()),
    is_verified: v.optional(v.boolean()),
    primary: v.optional(v.boolean()),
    average_likes: v.optional(v.number()),
    median_likes: v.optional(v.number()),
    average_comments: v.optional(v.number()),
    median_comments: v.optional(v.number()),
    average_reposts: v.optional(v.number()),
    median_reposts: v.optional(v.number()),
  })
    .index("by_creator_id", ["creator_id"])
    .index("by_channel", ["channel_id"])
    .index("by_processed", ["processed"])
    .index("by_to_be_updated", ["to_be_updated"])
    .index("by_last_refresh", ["last_refresh"]),

  facebook_channels: defineTable({
    creator_id: v.id("creators"),
    url: v.optional(v.string()),
    channel_id: v.string(),
    processed: v.optional(v.boolean()),
    last_refresh: v.optional(v.string()),
    is_active: v.optional(v.boolean()),
    not_found: v.optional(v.boolean()),
    followers: v.optional(v.number()),
    engagement_rate: v.optional(v.number()),
    username: v.optional(v.string()),
    page_reach: v.optional(v.number()),
    average_reactions: v.optional(v.number()),
    video_views: v.optional(v.number()),
  })
    .index("by_creator_id", ["creator_id"])
    .index("by_channel", ["channel_id"])
    .index("by_processed", ["processed"])
    .index("by_last_refresh", ["last_refresh"]),

  x_channels: defineTable({
    creator_id: v.id("creators"),
    joined_at: v.optional(v.string()),
    url: v.optional(v.string()),
    channel_id: v.string(),
    location: v.optional(v.string()),
    processed: v.optional(v.boolean()),
    followers: v.optional(v.number()),
    following: v.optional(v.number()),
    followers_count: v.optional(v.number()),
    following_count: v.optional(v.number()),
    like_count: v.optional(v.number()),
    listed_count: v.optional(v.number()),
    media_count: v.optional(v.number()),
    tweet_count: v.optional(v.number()),
    username: v.optional(v.string()),
    verified: v.optional(v.boolean()),
  })
    .index("by_creator_id", ["creator_id"])
    .index("by_channel", ["channel_id"]),

  brands: defineTable({
    name: v.string(),
    creationTime: v.optional(v.number()),
    category: v.optional(v.array(v.string())),
    country: v.optional(v.array(v.string())),
    industry: v.optional(v.array(v.string())),
    language: v.optional(v.array(v.string())),
    contacts: v.optional(v.array(v.string())),
    visibility: v.boolean(),
    description_short: v.optional(v.string()),
    description_long: v.optional(v.string()),
    company_name: v.optional(v.string()),
    business_email: v.optional(v.string()),
    business_phone: v.optional(v.string()),
    website: v.optional(v.string()),
    currency: v.optional(v.string()),
    logo_url: v.optional(v.string()),
    company_size: v.optional(v.string()),
    annual_budget: v.optional(v.number()),
  })
    .index("by_name", ["name"])
    .index("by_contacts", ["contacts"])
    .index("by_category", ["category"])
    .index("by_country", ["country"])
    .index("by_industry", ["industry"])
    .index("by_visibility", ["visibility"])
    .index("by_language", ["language"])
    .index("by_creation", ["creationTime"])
    .searchIndex("search_brands", {
      searchField: "name",
      filterFields: ["visibility", "category", "industry"],
    }),

  userProfiles: defineTable({
    userId: v.string(),
    userType: v.union(v.literal("brand"), v.literal("creator")),
    profiles: v.array(
      v.object({
        profileId: v.union(v.id("creators"), v.id("brands")),
        profileType: v.union(v.literal("brand"), v.literal("creator")),
        isActive: v.boolean(),
      })
    ),
    primaryProfileId: v.optional(v.union(v.id("creators"), v.id("brands"))),
    fullName: v.string(),
    emailAddress: v.string(),
    phoneNumber: v.optional(v.string()),
    country: v.string(),
    language: v.optional(v.string()),
    description: v.optional(v.string()),
    gender: v.optional(v.string()),
    contactDetails: v.optional(v.string()),
    creatorProfileName: v.optional(v.string()),
    onboardingCompleted: v.boolean(),
    onboardingFormSubmitted: v.boolean(),
    lastActive: v.number(),
    socialMedia: v.optional(
      v.object({
        youtube: v.string(),
        facebook: v.string(),
        twitch: v.string(),
        twitter: v.string(),
        instagram: v.string(),
        tiktok: v.string(),
      })
    ),
  })
    .index("by_userId", ["userId"])
    .index("by_primaryProfileId", ["primaryProfileId"]),

  creatorOffers: defineTable({
    creator_id: v.string(),
    platform: v.string(),
    title: v.string(),
    description: v.string(),
    price: v.number(),
    currency: v.string(),
  }).index("by_creator_id", ["creator_id"]),

  socialStatsQueue: defineTable({
    creator_id: v.id("creators"),
    lastProcessed: v.number(),
    status: v.string(), // "pending" | "processing" | "completed" | "failed"
    error: v.optional(v.string()),
  }).index("by_status_time", ["status", "lastProcessed"]),

  campaigns: defineTable({
    brandId: v.id("brands"),
    userId: v.string(),
    name: v.string(),
    brandName: v.string(),
    brandLogo: v.optional(v.string()),
    descriptionShort: v.string(),
    descriptionFull: v.string(),
    status: v.string(),
    startDate: v.string(),
    endDate: v.string(),
    applicationDeadline: v.string(),
    budget: v.optional(v.number()),
    compensation: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    category: v.optional(v.string()),
    language: v.optional(v.string()),
    country: v.optional(v.string()),
    targetAudience: v.string(),
    campaignGoals: v.string(),
    contentGuidelines: v.string(),
    creatorRequirements: v.optional(v.string()),
    kpi: v.optional(v.string()),
    socialPlatforms: v.array(v.string()),
    keyMessages: v.optional(v.array(v.string())),
    hashtags: v.optional(v.array(v.string())),
    performanceMetrics: v.optional(
      v.object({
        engagement: v.array(v.string()),
        conversions: v.optional(v.array(v.string())),
        impressions: v.optional(v.array(v.string())),
        otherMetrics: v.optional(v.array(v.string())),
      })
    ),
    descriptionEmbedding: v.optional(v.array(v.float64())),
    contentTags: v.optional(v.array(v.string())),
  })
    .index("by_brand_id", ["brandId"])
    .index("by_status", ["status"])
    .index("by_category", ["category"])
    .searchIndex("search_campaigns", {
      searchField: "name",
      filterFields: ["status", "category"],
    })
    .vectorIndex("by_description_embedding", {
      vectorField: "descriptionEmbedding",
      dimensions: 1536,
    }),

  campaignMatchHistory: defineTable({
    campaignId: v.id("campaigns"),
    creatorId: v.id("creators"),
    matchScore: v.number(),
    matchDate: v.number(),
    status: v.optional(v.string()),
    performanceMetrics: v.optional(
      v.object({
        engagement: v.optional(v.number()),
        conversion: v.optional(v.number()),
        clientSatisfaction: v.optional(v.number()),
      })
    ),
  })
    .index("by_campaign", ["campaignId"])
    .index("by_creator", ["creatorId"])
    .index("by_match_score", ["matchScore"]),

  stripeAccounts: defineTable({
    userId: v.string(), // Clerk User ID
    userType: v.union(v.literal("brand"), v.literal("creator")),
    profileId: v.union(v.id("brands"), v.id("creators")),
    stripeAccountId: v.optional(v.string()), // For creators (Connect Express)
    stripeCustomerId: v.optional(v.string()), // For brands (regular customers)
    isOnboarded: v.boolean(),
    onboardedAt: v.optional(v.string()),
    defaultCurrency: v.string(),
    metadata: v.object({
      country: v.string(),
      email: v.optional(v.string()),
      businessName: v.optional(v.string()),
      businessType: v.optional(v.string()),
      // Enhanced metadata for Stripe Connect status
      chargesEnabled: v.optional(v.boolean()),
      payoutsEnabled: v.optional(v.boolean()),
      hasExternalAccount: v.optional(v.boolean()),
      externalAccountType: v.optional(v.string()),
      lastStatusCheck: v.optional(v.string()),
      lastWebhookUpdate: v.optional(v.string()),
      lastExternalAccountUpdate: v.optional(v.string()),
      lastCapabilityUpdate: v.optional(v.string()),
      // Store requirements info
      requirementsDue: v.optional(v.array(v.string())),
      requirementsEventuallyDue: v.optional(v.array(v.string())),
      requirementsPastDue: v.optional(v.array(v.string())),
    }),
    createdAt: v.optional(v.string()),
    updatedAt: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_user_type", ["userId", "userType"])
    .index("by_profile", ["profileId"])
    .index("by_stripe_account", ["stripeAccountId"])
    .index("by_stripe_customer", ["stripeCustomerId"])
    .index("by_onboarded", ["isOnboarded"])
    .index("by_user_onboarded", ["userId", "isOnboarded"]),

  categories: defineTable({
    category: v.string(),
    description: v.optional(v.string()),
  }).index("category", ["category"]),
});
