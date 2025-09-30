import { v } from "convex/values";
import { internalMutation } from "../_generated/server";

/**
 * Crea un nuevo registro de mail
 */
export const createMail = internalMutation({
  args: {
    contactId: v.id("contacts"),
    userId: v.string(),
    userPrompt: v.string(),
  },
  returns: v.id("mails"), // ← Importante: especificar el tipo de retorno correcto
  handler: async (ctx, args) => {
    // Obtener el contacto para tener el email
    const contact = await ctx.db.get(args.contactId);
    if (!contact) throw new Error("Contact not found");

    // Obtener el perfil AI del contacto
    const aiProfile = await ctx.db
      .query("ai_profiles")
      .withIndex("by_contact_id", (q) => q.eq("contact_id", args.contactId))
      .first();
    if (!aiProfile) throw new Error("AI profile not found for this contact");

    const now = Date.now();

    const mailId = await ctx.db.insert("mails", {
      contact_id: args.contactId,
      ai_profile_id: aiProfile._id,
      user_id: args.userId,
      from_email: "", // Se llenará después
      to_email: contact.email,
      subject: "", // Se llenará después
      html_content: "", // Se llenará después
      user_prompt: args.userPrompt,
      send_status: "generating",
      created_at: now,
      updated_at: now,
    });

    return mailId; // Esto ya es de tipo Id<"mails">
  },
});

/**
 * Actualiza el contenido del mail generado por IA
 */
export const updateMailContent = internalMutation({
  args: {
    mailId: v.id("mails"),
    fromEmail: v.string(),
    subject: v.string(),
    htmlContent: v.string(),
    sendStatus: v.union(
      v.literal("draft"),
      v.literal("generating"),
      v.literal("ready"),
      v.literal("sent"),
      v.literal("failed"),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.mailId, {
      from_email: args.fromEmail,
      subject: args.subject,
      html_content: args.htmlContent,
      send_status: args.sendStatus,
      updated_at: Date.now(),
    });

    return null;
  },
});

/**
 * Actualiza el estado del mail
 */
export const updateMailStatus = internalMutation({
  args: {
    mailId: v.id("mails"),
    sendStatus: v.union(
      v.literal("draft"),
      v.literal("generating"),
      v.literal("ready"),
      v.literal("sent"),
      v.literal("failed"),
    ),
    errorMessage: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.mailId, {
      send_status: args.sendStatus,
      error_message: args.errorMessage,
      updated_at: Date.now(),
    });

    return null;
  },
});

/**
 * Actualiza el mail cuando se envía exitosamente
 */
export const updateMailSent = internalMutation({
  args: {
    mailId: v.id("mails"),
    resendEmailId: v.string(),
    sentAt: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.mailId, {
      send_status: "sent",
      resend_email_id: args.resendEmailId,
      sent_at: args.sentAt,
      updated_at: Date.now(),
    });

    return null;
  },
});
