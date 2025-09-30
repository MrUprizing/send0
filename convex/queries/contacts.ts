import { v } from "convex/values";
import { internalQuery } from "../_generated/server";

/**
 * Get a contact by ID (internal use only)
 */
export const getContact = internalQuery({
  args: { contactId: v.id("contacts") },
  returns: v.union(
    v.object({
      _id: v.id("contacts"),
      _creationTime: v.number(),
      user_id: v.string(),
      form_id: v.id("forms"),
      email: v.string(),
      source_url: v.optional(v.string()),
      additional_info: v.optional(v.string()),
      image_url: v.optional(v.string()),
      source_type: v.union(
        v.literal("newsletter"),
        v.literal("sales"),
        v.literal("demo"),
      ),
      status: v.union(
        v.literal("new"),
        v.literal("processing"),
        v.literal("ready"),
        v.literal("contacted"),
        v.literal("responded"),
      ),
      created_at: v.number(),
      updated_at: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.contactId);
  },
});

/**
 * Get AI profile by contact ID (internal use only)
 */
export const getProfileByContactId = internalQuery({
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
    return profile ?? null;
  },
});
