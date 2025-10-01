"use node";
import { generateObject } from "ai";
import { v } from "convex/values";
import { z } from "zod";
import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { action } from "../_generated/server";

/**
 * Generates a personalized email based on the contact's AI profile
 */
export const generateEmailFromProfile = action({
  args: {
    contactId: v.id("contacts"),
    userPrompt: v.string(),
    userId: v.string(),
    sendImmediately: v.optional(v.boolean()), // Si es true, envía el email inmediatamente
  },
  returns: v.object({
    mailId: v.id("mails"),
    status: v.string(),
  }),
  handler: async (
    ctx,
    args,
  ): Promise<{ mailId: Id<"mails">; status: string }> => {
    // Get sender email from environment variable
    const senderEmail = process.env.SENDER_EMAIL;
    const senderName = process.env.SENDER_NAME || "Sales Team";

    if (!senderEmail) {
      throw new Error(
        "SENDER_EMAIL environment variable is not configured. Please set it in your Convex dashboard.",
      );
    }

    // Validate email format (must be in a verified domain for Resend)
    if (!senderEmail.includes("@")) {
      throw new Error("SENDER_EMAIL must be a valid email address");
    }
    // Get the contact
    const contact = await ctx.runQuery(internal.queries.contacts.getContact, {
      contactId: args.contactId,
    });
    if (!contact) throw new Error("Contact not found");

    // Get the AI profile
    const aiProfile = await ctx.runQuery(
      internal.queries.contacts.getProfileByContactId,
      { contactId: args.contactId },
    );
    if (!aiProfile) throw new Error("AI profile not found for this contact");

    // Check if AI profile is completed
    if (aiProfile.processing_status !== "completed") {
      throw new Error(
        "AI profile is not ready yet. Please wait for the profile analysis to complete.",
      );
    }

    // Prepare the prompt for the AI
    const prompt = `You are a professional email writer specialized in personalized outreach. Generate a highly personalized email based on the following information if you don't know about x data. Use colors and custom styles:

Contact Information:
- Email: ${contact.email}
- Source Type: ${contact.source_type}
- Source URL: ${contact.source_url || "N/A"}
- Additional Info: ${contact.additional_info || "N/A"}

AI Profile Analysis:
- Profile Summary: ${aiProfile.profile_analysis || "N/A"}
- Industry: ${aiProfile.industry || "N/A"}
- Suggested Email Subject (reference): ${aiProfile.email_subject || "N/A"}
- Email Example (for style reference): ${aiProfile.email_html_example || "N/A"}
- Recommended Tone: ${aiProfile.tone_preference || "professional"}
- Key Interests: ${aiProfile.key_interests?.join(", ") || "N/A"}

User's Email Topic/Request:
${args.userPrompt}

Based on ALL the information above, generate a complete, professional email with:
1. subject: A compelling, personalized subject line that:
   - Relates to the user's request
   - Appeals to the contact's key interests
   - Follows the recommended tone
2. html_content: A well-structured HTML email that:
   - Starts with a personalized greeting using context from the profile
   - References specific details from their industry/interests/profile
   - Addresses the topic the user requested
   - Uses the recommended tone (${aiProfile.tone_preference || "professional"})
   - Includes relevant value propositions based on their key interests
   - Has a clear and compelling call-to-action
   - Is professionally formatted with proper HTML structure
   - Includes a professional signature
   - Feels authentic and NOT like a template

Make it highly personalized, persuasive, and tailored to this specific contact's profile and interests. The email should feel like it was written specifically for them after thorough research.`;

    // Call the AI to generate the email
    const { object } = await generateObject({
      model: "openai/gpt-5-mini",
      schema: z.object({
        subject: z.string(),
        html_content: z.string(),
      }),
      prompt,
    });

    // Format the "from" email correctly for Resend: "Name <email@domain.com>"
    const fromEmail = `${senderName} <${senderEmail}>`;

    // Create the mail record with the generated content
    const mailId: Id<"mails"> = await ctx.runMutation(
      internal.mutations.mail.createMailComplete,
      {
        contactId: args.contactId,
        aiProfileId: aiProfile._id,
        userId: args.userId,
        fromEmail: fromEmail,
        toEmail: contact.email,
        subject: object.subject,
        htmlContent: object.html_content,
        userPrompt: args.userPrompt,
        sendStatus: "ready",
      },
    );

    // If sendImmediately is true, schedule the email to be sent
    if (args.sendImmediately) {
      await ctx.scheduler.runAfter(
        0,
        internal.actions.emailsender.sendEmailInternal,
        {
          mailId,
        },
      );
    }

    return {
      mailId,
      status: args.sendImmediately ? "sending" : "ready",
    };
  },
});
