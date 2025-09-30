"use node";
import { generateObject } from "ai";
import { v } from "convex/values";
import { z } from "zod";
import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";

/**
 * Genera el perfil AI usando el scraped_data y actualiza ai_profiles.
 */
export const generateProfile = internalAction({
  args: { contactId: v.id("contacts") },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Obtén el contacto
    const contact = await ctx.runQuery(internal.queries.contacts.getContact, {
      contactId: args.contactId,
    });
    if (!contact) throw new Error("Contact not found");

    // Obtén el ai_profile y el scraped_data
    const aiProfile = await ctx.runQuery(
      internal.queries.contacts.getProfileByContactId,
      { contactId: args.contactId },
    );
    if (!aiProfile) throw new Error("AI profile not found");
    const scrapedData = aiProfile.scraped_data ?? null;

    // Prepara el prompt
    const prompt = `You are a sales intelligence assistant. Analyze the following contact information and scraped website data to generate a comprehensive sales profile.

Contact Information:
${JSON.stringify(contact, null, 2)}

Scraped Website Data:
${JSON.stringify(scrapedData, null, 2)}

Based on this information, generate a sales profile with the following:

1. profile_analysis: A detailed summary of the contact's profile, including their role, company background, and potential pain points.

2. industry: Identify the primary industry this contact operates in.

3. email_subject: Create a compelling, personalized email subject line that would grab their attention.

4. email_html_example: Generate a professional HTML email template tailored to this contact. Include personalization elements and a clear call-to-action.

5. tone_preference: Recommend the most appropriate tone for communication (e.g., "formal", "casual", "technical", "consultative").

6. key_interests: List 3-5 key interests, challenges, or priorities this contact likely has based on their profile and website content.

Make the analysis actionable and specific to this contact's context.`;

    // Llama a la IA
    const { object } = await generateObject({
      model: "openai/gpt-5-mini",
      schema: z.object({
        profile_analysis: z.string(),
        industry: z.string().optional(),
        email_subject: z.string().optional(),
        email_html_example: z.string().optional(),
        tone_preference: z.string().optional(),
        key_interests: z.array(z.string()).optional(),
      }),
      prompt,
    });

    // Actualiza el ai_profile con los datos generados
    await ctx.runMutation(internal.mutations.profile.updateProfileAIFields, {
      profileId: aiProfile._id,
      profile_analysis: object.profile_analysis,
      industry: object.industry,
      email_subject: object.email_subject,
      email_html_example: object.email_html_example,
      tone_preference: object.tone_preference,
      key_interests: object.key_interests,
      processing_status: "completed",
      updated_at: Date.now(),
    });

    return null;
  },
});
