import { v } from "convex/values";
import { internalMutation } from "../_generated/server";

/**
 * Crea un ai_profile con scraped_data y estado "pending".
 */
export const createProfileWithScrapedData = internalMutation({
  args: {
    contact_id: v.id("contacts"),
    scraped_data: v.any(),
    processing_status: v.literal("pending"),
    created_at: v.number(),
    updated_at: v.number(),
  },
  returns: v.id("ai_profiles"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("ai_profiles", args);
  },
});

/**
 * Actualiza solo el campo scraped_data de un ai_profile existente.
 */
export const updateProfileScrapedData = internalMutation({
  args: {
    profileId: v.id("ai_profiles"),
    scraped_data: v.any(),
    updated_at: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.profileId, {
      scraped_data: args.scraped_data,
      updated_at: args.updated_at,
    });
    return null;
  },
});

/**
 * Actualiza los campos generados por IA en ai_profile.
 */
export const updateProfileAIFields = internalMutation({
  args: {
    profileId: v.id("ai_profiles"),
    profile_analysis: v.string(),
    industry: v.optional(v.string()),
    email_subject: v.optional(v.string()),
    email_html_example: v.optional(v.string()),
    tone_preference: v.optional(v.string()),
    key_interests: v.optional(v.array(v.string())),
    processing_status: v.literal("completed"),
    updated_at: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.profileId, {
      profile_analysis: args.profile_analysis,
      industry: args.industry,
      email_subject: args.email_subject,
      email_html_example: args.email_html_example,
      tone_preference: args.tone_preference,
      key_interests: args.key_interests,
      processing_status: args.processing_status,
      updated_at: args.updated_at,
    });
    return null;
  },
});

/**
 * Actualiza solo el estado de procesamiento del perfil
 */
export const updateProfileStatus = internalMutation({
  args: {
    profileId: v.id("ai_profiles"),
    processing_status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed"),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.profileId, {
      processing_status: args.processing_status,
      updated_at: Date.now(),
    });
    return null;
  },
});
