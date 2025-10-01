import { httpRouter } from "convex/server";
import { api } from "./_generated/api";
import { httpAction } from "./_generated/server";
import { authComponent, createAuth } from "./auth";

const http = httpRouter();

authComponent.registerRoutes(http, createAuth);

http.route({
  path: "/create-contact",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();

    // Call the mutation to create a contact
    try {
      const contactId: string = await ctx.runMutation(
        api.mutations.contact.createContact,
        body,
      );

      return new Response(JSON.stringify({ contactId }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
});

export default http;
