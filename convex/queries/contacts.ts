import { v } from "convex/values";
import type { Doc } from "../_generated/dataModel";
import { internalQuery } from "../_generated/server";

export const getContact = internalQuery({
  args: { contactId: v.id("contacts") },
  returns: v.any(),
  handler: async (ctx, args) => {
    const contact: Doc<"contacts"> | null = await ctx.db.get(args.contactId);
    return contact;
  },
});

export const getProfileByContactId = internalQuery({
  args: { contactId: v.id("contacts") },
  returns: v.union(
    v.object({
      scraped_data: v.optional(v.any()),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("ai_profiles")
      .withIndex("by_contact_id", (q) => q.eq("contact_id", args.contactId))
      .unique();
    if (!profile) return null;
    return { scraped_data: profile.scraped_data };
  },
});
