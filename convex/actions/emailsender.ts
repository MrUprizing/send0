"use node";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { action, internalAction } from "../_generated/server";
import { resend } from "../mutations/resend";

/**
 * Acción pública para enviar un email
 */
export const sendEmail = action({
  args: {
    mailId: v.id("mails"),
  },
  returns: v.object({
    success: v.boolean(),
    emailId: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    // Programar el envío
    await ctx.scheduler.runAfter(
      0,
      internal.actions.emailsender.sendEmailInternal,
      {
        mailId: args.mailId,
      },
    );

    return {
      success: true,
    };
  },
});

/**
 * Acción interna que realiza el envío del email
 */
export const sendEmailInternal = internalAction({
  args: { mailId: v.id("mails") },
  returns: v.null(),
  handler: async (ctx, args) => {
    try {
      // Obtener el mail
      const mail = await ctx.runQuery(internal.queries.mail.getMailById, {
        mailId: args.mailId,
      });
      if (!mail) throw new Error("Mail not found");

      // Verificar que el mail esté listo para enviar
      if (mail.send_status !== "ready") {
        throw new Error(
          `Mail is not ready to send. Current status: ${mail.send_status}`,
        );
      }

      // Enviar el email usando Resend
      const result = await resend.sendEmail(ctx, {
        from: mail.from_email,
        to: mail.to_email,
        subject: mail.subject,
        html: mail.html_content,
      });

      // Actualizar el mail como enviado
      await ctx.runMutation(internal.mutations.mail.updateMailSent, {
        mailId: args.mailId,
        resendEmailId: result,
        sentAt: Date.now(),
      });

      // Actualizar el contacto como "contacted"
      await ctx.runMutation(internal.mutations.contact.updateContactStatus, {
        contactId: mail.contact_id,
        status: "contacted",
      });
    } catch (error) {
      console.error("Error sending email:", error);

      // Marcar el mail como fallido
      await ctx.runMutation(internal.mutations.mail.updateMailStatus, {
        mailId: args.mailId,
        sendStatus: "failed",
        errorMessage:
          error instanceof Error ? error.message : "Failed to send email",
      });
    }

    return null;
  },
});
