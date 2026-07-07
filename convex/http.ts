import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/players",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { firstName, lastName, game } = body as Record<string, unknown>;

    try {
      const playerId = await ctx.runMutation(api.players.registerPlayer, {
        firstName: String(firstName ?? ""),
        lastName: String(lastName ?? ""),
        game: String(game ?? ""),
      });

      return new Response(JSON.stringify({ id: playerId }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Internal server error";
      return new Response(JSON.stringify({ error: message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
});

export default http;
