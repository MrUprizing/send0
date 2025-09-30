import { v } from "convex/values";
import { internalQuery, query } from "../_generated/server";

/**
 * Query interna para obtener el perfil AI por ID
 */
export const getProfileById = internalQuery({
  args: { profileId: v.id("ai_profiles") },
  returns: v.union(
    v.object({
      _id: v.id("ai_profiles"),
      _creationTime: v.number(),
      contact_id: v.id("contacts"),
      scraped_data: v.optional(v.any()),
      profile_analysis: v.optional(v.string()),
      industry: v.optional(v.string()),
      email_subject: v.optional(v.string()),
      email_html_example: v.optional(v.string()),
      tone_preference: v.optional(v.string()),
      key_interests: v.optional(v.array(v.string())),
      processing_status: v.union(
        v.literal("pending"),
        v.literal("completed"),
        v.literal("failed"),
      ),
      created_at: v.number(),
      updated_at: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.profileId);
  },
});

/**
 * Query pública para obtener el perfil AI de un contacto
 */
export const getProfileByContactId = query({
  args: { contactId: v.id("contacts") },
  returns: v.union(
    v.object({
      _id: v.id("ai_profiles"),
      _creationTime: v.number(),
      contact_id: v.id("contacts"),
      scraped_data: v.optional(v.any()),
      profile_analysis: v.optional(v.string()),
      industry: v.optional(v.string()),
      email_subject: v.optional(v.string()),
      email_html_example: v.optional(v.string()),
      tone_preference: v.optional(v.string()),
      key_interests: v.optional(v.array(v.string())),
      processing_status: v.union(
        v.literal("pending"),
        v.literal("completed"),
        v.literal("failed"),
      ),
      created_at: v.number(),
      updated_at: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("ai_profiles")
      .withIndex("by_contact_id", (q) => q.eq("contact_id", args.contactId))
      .first();

    return profile;
  },
});
