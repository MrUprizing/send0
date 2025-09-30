import { v } from "convex/values";
import { mutation } from "../_generated/server";

/**
 * Crea un nuevo formulario usando el usuario autenticado.
 */
export const createForm = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    created_at: v.number(),
  },
  returns: v.id("forms"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    // Puedes usar identity.subject, identity.email, etc. según tu sistema
    const user_id = identity.subject;

    const formId = await ctx.db.insert("forms", {
      user_id,
      name: args.name,
      description: args.description,
      created_at: args.created_at,
    });
    return formId;
  },
});
