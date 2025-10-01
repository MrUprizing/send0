import { v } from "convex/values";
import { query } from "../_generated/server";

/**
 * Get all forms for the authenticated user
 */
export const getFormsByUser = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("forms"),
      _creationTime: v.number(),
      user_id: v.string(),
      name: v.string(),
      description: v.optional(v.string()),
      created_at: v.number(),
    }),
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user_id = identity.subject;

    const forms = await ctx.db
      .query("forms")
      .filter((q) => q.eq(q.field("user_id"), user_id))
      .collect();

    return forms;
  },
});
