"use node";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";

/**
 * Coordina el proceso completo: crawl + generación de perfil AI
 */
export const processContact = internalAction({
  args: {
    contactId: v.id("contacts"),
    url: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    try {
      // Paso 1: Realizar el crawl y guardar scraped_data
      await ctx.runAction(internal.actions.firecrawl.crawlContact, {
        contactId: args.contactId,
        url: args.url,
      });

      // Paso 2: Generar el perfil AI con los datos scrapeados
      await ctx.runAction(internal.actions.aiprofile.generateProfile, {
        contactId: args.contactId,
      });

      // Actualizar el status del contacto a "ready"
      await ctx.runMutation(internal.mutations.contact.updateContactStatus, {
        contactId: args.contactId,
        status: "ready",
      });
    } catch (error) {
      console.error("Error processing contact:", error);

      // Marcar como fallido si algo sale mal
      await ctx.runMutation(internal.mutations.contact.updateContactStatus, {
        contactId: args.contactId,
        status: "new",
      });

      // Actualizar el perfil AI como failed si existe
      const profile = await ctx.runQuery(
        internal.queries.contacts.getProfileByContactId,
        { contactId: args.contactId },
      );
      if (profile) {
        await ctx.runMutation(internal.mutations.profile.updateProfileStatus, {
          profileId: profile._id,
          processing_status: "failed",
        });
      }
    }
    return null;
  },
});
