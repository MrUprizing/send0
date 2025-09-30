import { v } from "convex/values";
import { mutation } from "../_generated/server";

/**
 * Create a new contact associated with a form.
 */
export const createContact = mutation({
  args: {
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
  },
  returns: v.id("contacts"),
  handler: async (ctx, args) => {
    const form = await ctx.db.get(args.form_id);
    if (!form) {
      throw new Error("Form not found");
    }
    const user_id = form.user_id;

    const contactId = await ctx.db.insert("contacts", {
      user_id,
      ...args,
    });
    return contactId;
  },
});
