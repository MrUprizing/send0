import { v } from "convex/values";
import { query } from "../_generated/server";

/**
 * Get dashboard statistics for the authenticated user
 */
export const getDashboardStats = query({
  args: {},
  returns: v.object({
    totalContacts: v.number(),
    totalEmails: v.number(),
    totalForms: v.number(),
    emailsSent: v.number(),
    contactsReady: v.number(),
  }),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    const userId = identity.subject;
    
    // Get total contacts
    const contacts = await ctx.db
      .query("contacts")
      .withIndex("by_user_id", (q) => q.eq("user_id", userId))
      .collect();
    
    // Get total emails
    const emails = await ctx.db
      .query("mails")
      .withIndex("by_user_id", (q) => q.eq("user_id", userId))
      .collect();
    
    // Get total forms
    const forms = await ctx.db
      .query("forms")
      .filter((q) => q.eq(q.field("user_id"), userId))
      .collect();
    
    // Count emails sent
    const emailsSent = emails.filter((email) => email.send_status === "sent").length;
    
    // Count contacts ready
    const contactsReady = contacts.filter((contact) => contact.status === "ready").length;
    
    return {
      totalContacts: contacts.length,
      totalEmails: emails.length,
      totalForms: forms.length,
      emailsSent,
      contactsReady,
    };
  },
});

/**
 * Get recent AI profiles for the authenticated user
 */
export const getRecentAiProfiles = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("ai_profiles"),
      _creationTime: v.number(),
      contact_id: v.id("contacts"),
      profile_analysis: v.optional(v.string()),
      industry: v.optional(v.string()),
      processing_status: v.union(
        v.literal("pending"),
        v.literal("completed"),
        v.literal("failed")
      ),
      created_at: v.number(),
      contactEmail: v.string(),
    })
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    const userId = identity.subject;
    
    // Get all contacts for this user
    const contacts = await ctx.db
      .query("contacts")
      .withIndex("by_user_id", (q) => q.eq("user_id", userId))
      .collect();
    
    const contactIds = contacts.map((c) => c._id);
    
    // Get AI profiles for these contacts
    const aiProfiles = await ctx.db
      .query("ai_profiles")
      .collect();
    
    // Filter and map AI profiles
    const userAiProfiles = aiProfiles
      .filter((profile) => contactIds.includes(profile.contact_id))
      .sort((a, b) => b.created_at - a.created_at)
      .slice(0, 10);
    
    // Enrich with contact email
    const enrichedProfiles = [];
    for (const profile of userAiProfiles) {
      const contact = await ctx.db.get(profile.contact_id);
      if (contact) {
        enrichedProfiles.push({
          _id: profile._id,
          _creationTime: profile._creationTime,
          contact_id: profile.contact_id,
          profile_analysis: profile.profile_analysis,
          industry: profile.industry,
          processing_status: profile.processing_status,
          created_at: profile.created_at,
          contactEmail: contact.email,
        });
      }
    }
    
    return enrichedProfiles;
  },
});

