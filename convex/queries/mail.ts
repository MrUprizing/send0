import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { internalQuery, query } from "../_generated/server";

/**
 * Query interna para obtener un mail por ID
 */
export const getMailById = internalQuery({
  args: { mailId: v.id("mails") },
  returns: v.union(
    v.object({
      _id: v.id("mails"),
      _creationTime: v.number(),
      contact_id: v.id("contacts"),
      ai_profile_id: v.id("ai_profiles"),
      user_id: v.string(),
      from_email: v.string(),
      to_email: v.string(),
      subject: v.string(),
      html_content: v.string(),
      user_prompt: v.string(),
      send_status: v.union(
        v.literal("draft"),
        v.literal("generating"),
        v.literal("ready"),
        v.literal("sent"),
        v.literal("failed"),
      ),
      resend_email_id: v.optional(v.string()),
      error_message: v.optional(v.string()),
      sent_at: v.optional(v.number()),
      created_at: v.number(),
      updated_at: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.mailId);
  },
});

/**
 * Query pública para obtener un mail por ID
 */
export const getMail = query({
  args: { mailId: v.id("mails") },
  returns: v.union(
    v.object({
      _id: v.id("mails"),
      _creationTime: v.number(),
      contact_id: v.id("contacts"),
      ai_profile_id: v.id("ai_profiles"),
      user_id: v.string(),
      from_email: v.string(),
      to_email: v.string(),
      subject: v.string(),
      html_content: v.string(),
      user_prompt: v.string(),
      send_status: v.union(
        v.literal("draft"),
        v.literal("generating"),
        v.literal("ready"),
        v.literal("sent"),
        v.literal("failed"),
      ),
      resend_email_id: v.optional(v.string()),
      error_message: v.optional(v.string()),
      sent_at: v.optional(v.number()),
      created_at: v.number(),
      updated_at: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.mailId);
  },
});

/**
 * Query para obtener todos los mails de un usuario
 */
export const getMailsByUserId = query({
  args: { userId: v.string() },
  returns: v.array(
    v.object({
      _id: v.id("mails"),
      _creationTime: v.number(),
      contact_id: v.id("contacts"),
      ai_profile_id: v.id("ai_profiles"),
      user_id: v.string(),
      from_email: v.string(),
      to_email: v.string(),
      subject: v.string(),
      html_content: v.string(),
      user_prompt: v.string(),
      send_status: v.union(
        v.literal("draft"),
        v.literal("generating"),
        v.literal("ready"),
        v.literal("sent"),
        v.literal("failed"),
      ),
      resend_email_id: v.optional(v.string()),
      error_message: v.optional(v.string()),
      sent_at: v.optional(v.number()),
      created_at: v.number(),
      updated_at: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    const mails = await ctx.db
      .query("mails")
      .withIndex("by_user_id", (q) => q.eq("user_id", args.userId))
      .order("desc")
      .collect();

    return mails;
  },
});

/**
 * Query para obtener todos los mails de un contacto
 */
export const getMailsByContactId = query({
  args: { contactId: v.id("contacts") },
  returns: v.array(
    v.object({
      _id: v.id("mails"),
      _creationTime: v.number(),
      contact_id: v.id("contacts"),
      ai_profile_id: v.id("ai_profiles"),
      user_id: v.string(),
      from_email: v.string(),
      to_email: v.string(),
      subject: v.string(),
      html_content: v.string(),
      user_prompt: v.string(),
      send_status: v.union(
        v.literal("draft"),
        v.literal("generating"),
        v.literal("ready"),
        v.literal("sent"),
        v.literal("failed"),
      ),
      resend_email_id: v.optional(v.string()),
      error_message: v.optional(v.string()),
      sent_at: v.optional(v.number()),
      created_at: v.number(),
      updated_at: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    const mails = await ctx.db
      .query("mails")
      .withIndex("by_contact_id", (q) => q.eq("contact_id", args.contactId))
      .order("desc")
      .collect();

    return mails;
  },
});

/**
 * Query paginada para obtener todos los emails del usuario
 */
export const listEmails = query({
  args: {
    userId: v.string(),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("mails")
      .withIndex("by_user_id", (q) => q.eq("user_id", args.userId))
      .order("desc")
      .paginate(args.paginationOpts);
  },
});
