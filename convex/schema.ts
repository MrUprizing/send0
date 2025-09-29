import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  contacts: defineTable({
    user_id: v.string(),
    form_id: v.id("forms"),
    email: v.string(),
    source_url: v.optional(v.string()),
    additional_info: v.optional(v.string()), // texto largo
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
    created_at: v.number(), // Date.now()
    updated_at: v.number(),
  }),

  // Formularios creados por cada usuario
  forms: defineTable({
    user_id: v.string(), // referencia al dueño
    name: v.string(), // nombre interno ("Landing page form")
    description: v.optional(v.string()),
    created_at: v.number(),
  }),

  ai_profiles: defineTable({
    contact_id: v.id("contacts"),
    scraped_data: v.any(), // JSON sin restricción
    profile_analysis: v.optional(v.string()),
    industry: v.optional(v.string()),
    email_subject: v.optional(v.string()),
    email_html_example: v.optional(v.string()),
    tone_preference: v.optional(v.string()), // formal, casual, etc
    key_interests: v.optional(v.array(v.string())),
    processing_status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed"),
    ),
    created_at: v.number(),
    updated_at: v.number(),
  }),
});
