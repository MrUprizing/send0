"use node";
import { generateObject } from "ai";
import { v } from "convex/values";
import { z } from "zod";
import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { action, internalAction } from "../_generated/server";

/**
 * Acción pública que genera un email personalizado usando IA
 */
export const generateEmail = action({
  args: {
    contactId: v.id("contacts"),
    userPrompt: v.string(),
    userId: v.string(),
  },
  returns: v.object({
    mailId: v.id("mails"),
    status: v.string(),
  }),
  handler: async (
    ctx,
    args,
  ): Promise<{ mailId: Id<"mails">; status: string }> => {
    // Crear el registro de mail en estado "generating"
    // Agregar anotación de tipo explícita
    const mailId: Id<"mails"> = await ctx.runMutation(
      internal.mutations.mail.createMail,
      {
        contactId: args.contactId,
        userId: args.userId,
        userPrompt: args.userPrompt,
      },
    );

    // Programar la generación del contenido
    await ctx.scheduler.runAfter(
      0,
      internal.actions.email.generateEmailContent,
      {
        mailId,
      },
    );

    return {
      mailId,
      status: "generating",
    };
  },
});

/**
 * Acción interna que genera el contenido del email
 */
export const generateEmailContent = internalAction({
  args: { mailId: v.id("mails") },
  returns: v.null(),
  handler: async (ctx, args): Promise<null> => {
    try {
      // Obtener el mail
      const mail = await ctx.runQuery(internal.queries.mail.getMailById, {
        mailId: args.mailId,
      });
      if (!mail) throw new Error("Mail not found");

      // Obtener el contacto
      const contact = await ctx.runQuery(internal.queries.contacts.getContact, {
        contactId: mail.contact_id,
      });
      if (!contact) throw new Error("Contact not found");

      // Obtener el perfil AI
      const aiProfile = await ctx.runQuery(
        internal.queries.aiprofile.getProfileById,
        {
          profileId: mail.ai_profile_id,
        },
      );
      if (!aiProfile) throw new Error("AI profile not found");

      // Preparar el prompt para la IA
      const prompt = `You are a professional email writer. Generate a personalized sales email based on the following information:

Contact Information:
- Email: ${contact.email}
- Source Type: ${contact.source_type}
- Additional Info: ${contact.additional_info || "N/A"}

AI Profile Analysis:
- Profile Summary: ${aiProfile.profile_analysis || "N/A"}
- Industry: ${aiProfile.industry || "N/A"}
- Suggested Email Subject: ${aiProfile.email_subject || "N/A"}
- Previous Email Example: ${aiProfile.email_html_example || "N/A"}
- Recommended Tone: ${aiProfile.tone_preference || "professional"}
- Key Interests: ${aiProfile.key_interests?.join(", ") || "N/A"}

User's Email Topic/Request:
${mail.user_prompt}

Generate a complete email with:
1. from_email: Use the format "Sender Name <sender@domain.com>" (use a professional sender name based on the context)
2. subject: A compelling subject line that fits the user's request and the contact's profile
3. html_content: A professional HTML email that:
   - Is personalized to the contact
   - Addresses the topic the user requested
   - Uses the recommended tone
   - Includes a clear call-to-action
   - Is well-formatted with proper HTML tags
   - Includes the sender's signature

Make it professional, persuasive, and tailored to the contact's interests.`;

      // Llamar a la IA
      const { object } = await generateObject({
        model: "openai/gpt-4o-mini",
        schema: z.object({
          from_email: z.string(),
          subject: z.string(),
          html_content: z.string(),
        }),
        prompt,
        abortSignal: AbortSignal.timeout(30000),
      });

      // Actualizar el mail con el contenido generado
      await ctx.runMutation(internal.mutations.mail.updateMailContent, {
        mailId: args.mailId,
        fromEmail: object.from_email,
        subject: object.subject,
        htmlContent: object.html_content,
        sendStatus: "ready",
      });
    } catch (error) {
      console.error("Error generating email content:", error);

      // Marcar el mail como fallido
      await ctx.runMutation(internal.mutations.mail.updateMailStatus, {
        mailId: args.mailId,
        sendStatus: "failed",
        errorMessage:
          error instanceof Error ? error.message : "Unknown error occurred",
      });
    }

    return null;
  },
});
