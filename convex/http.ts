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
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (err: any) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }
  }),
});
http.route({
  path: "/create-contact",
  method: "OPTIONS",
  handler: httpAction(async (ctx, request) => {
    // return only CORS headers
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400",
      },
    });
  }),
});

export default http;
