import { v } from "convex/values";
import { mutation, internalMutation } from "../_generated/server";
import { internal } from "../_generated/api";

/**
 * Create a new contact associated with a form and trigger AI profile generation.
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

    // Inicia el proceso de generación del perfil AI si hay source_url
    if (args.source_url) {
      await ctx.scheduler.runAfter(
        0,
        internal.actions.orchestador.processContact,
        {
          contactId,
          url: args.source_url,
        },
      );
    }

    return contactId;
  },
});

/**
 * Update contact status (internal use only)
 */
export const updateContactStatus = internalMutation({
  args: {
    contactId: v.id("contacts"),
    status: v.union(
      v.literal("new"),
      v.literal("processing"),
      v.literal("ready"),
      v.literal("contacted"),
      v.literal("responded"),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.contactId, {
      status: args.status,
      updated_at: Date.now(),
    });
    return null;
  },
});
