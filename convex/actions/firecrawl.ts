"use node";
import Firecrawl from "@mendable/firecrawl-js";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";

/**
 * Realiza crawling de datos para un contacto y guarda el resultado en ai_profiles.
 * Si ya existe el ai_profile, actualiza solo el campo scraped_data.
 * Si no existe, crea el ai_profile con scraped_data y estado "pending".
 */
export const crawlContact = internalAction({
  args: {
    contactId: v.id("contacts"),
    url: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const firecrawl = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY });

    // Realiza el crawl
    const crawlResponse = await firecrawl.crawl(args.url, {
      limit: 2,
      scrapeOptions: { formats: ["markdown"] },
    });

    // Busca si ya existe el ai_profile para este contacto
    const existingProfile = await ctx.runQuery(
      internal.queries.contacts.getProfileByContactId,
      { contactId: args.contactId },
    );

    if (existingProfile) {
      // Actualiza solo el campo scraped_data y updated_at
      await ctx.runMutation(
        internal.mutations.profile.updateProfileScrapedData,
        {
          profileId: existingProfile._id,
          scraped_data: crawlResponse,
          updated_at: Date.now(),
        },
      );
    } else {
      // Crea el ai_profile con scraped_data y estado "pending"
      await ctx.runMutation(
        internal.mutations.profile.createProfileWithScrapedData,
        {
          contact_id: args.contactId,
          scraped_data: crawlResponse,
          processing_status: "pending",
          created_at: Date.now(),
          updated_at: Date.now(),
        },
      );
    }

    return null;
  },
});
