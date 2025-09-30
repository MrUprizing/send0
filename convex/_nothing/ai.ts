"use node";
import { generateObject } from "ai";
import { v } from "convex/values";
import { z } from "zod";
import { internal } from "../_generated/api";
import { action } from "../_generated/server";

export const generateProfile = action({
  args: { contactId: v.id("contacts") },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Obtén el contacto
    const contact = await ctx.runQuery(internal.queries.contacts.getContact, {
      contactId: args.contactId,
    });
    if (!contact) throw new Error("Contact not found");

    // Obtén el perfil AI y el scraped_data
    const aiProfile = await ctx.runQuery(
      internal.queries.contacts.getProfileByContactId,
      {
        contactId: args.contactId,
      },
    );
    const scrapedData = aiProfile?.scraped_data ?? null;

    // Prepara el prompt incluyendo el scraped_data si existe
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

    // Guarda el perfil
    await ctx.runMutation();

    return null;
  },
});
