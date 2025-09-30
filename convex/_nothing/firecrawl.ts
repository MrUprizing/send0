"use node";
import Firecrawl from "@mendable/firecrawl-js";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { action } from "../_generated/server";

export const crawlContact = action({
  args: {
    contactId: v.id("contacts"),
    url: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Instancia Firecrawl con tu API Key
    const firecrawl = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY });

    // Realiza el crawl (puedes ajustar limit y scrapeOptions según tu necesidad)
    const crawlResponse = await firecrawl.crawl(args.url, {
      limit: 2,
      scrapeOptions: {
        formats: ["json"],
      },
    });

    // Guarda el resultado en ai_profiles (campo scraped_data)
    await ctx.runMutation(internal.mutations.ai.saveScrapedData, {
      contactId: args.contactId,
      scraped_data: crawlResponse,
    });

    return null;
  },
});
