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
    const prompt = `Genera un perfil de ventas para este contacto. Devuelve un objeto JSON con los siguientes campos:
- profile_analysis: resumen del perfil del contacto
- industry: industria del contacto
- email_subject: asunto sugerido para un email de contacto
- email_html_example: ejemplo de email en HTML
- tone_preference: tono sugerido (formal, casual, etc)
- key_interests: lista de intereses clave del contacto

Contacto: ${JSON.stringify(contact)}
Scraped data: ${JSON.stringify(scrapedData)}`;

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
