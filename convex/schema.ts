import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  contacts: defineTable({
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
  })
    .index("by_user_id", ["user_id"])
    .index("by_user_id_and_created_at", ["user_id", "created_at"]),

  forms: defineTable({
    user_id: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    created_at: v.number(),
  }),

  ai_profiles: defineTable({
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
  }).index("by_contact_id", ["contact_id"]),

  mails: defineTable({
    contact_id: v.id("contacts"),
    ai_profile_id: v.id("ai_profiles"),
    user_id: v.string(),
    from_email: v.string(),
    to_email: v.string(),
    subject: v.string(),
    html_content: v.string(),
    user_prompt: v.string(), // Lo que el usuario escribió sobre el tema del email
    send_status: v.union(
      v.literal("draft"),
      v.literal("generating"),
      v.literal("ready"),
      v.literal("sent"),
      v.literal("failed"),
    ),
    resend_email_id: v.optional(v.string()), // ID de Resend cuando se envía
    error_message: v.optional(v.string()),
    sent_at: v.optional(v.number()),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_contact_id", ["contact_id"])
    .index("by_user_id", ["user_id"])
    .index("by_send_status", ["send_status"]),
});
