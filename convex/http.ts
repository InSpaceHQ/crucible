import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/players",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    console.log(`[POST /players] Received`);

    const authHeader = request.headers.get("Authorization");
    const token = process.env.REGISTER_BEARER_TOKEN;
    if (!token) {
      console.log(
        `[POST /players] FAIL: REGISTER_BEARER_TOKEN env var not set`,
      );
      return new Response(JSON.stringify({ error: "Server misconfigured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (!authHeader || authHeader !== `Bearer ${token}`) {
      console.log(`[POST /players] FAIL: Unauthorized — header=${authHeader}`);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log(`[POST /players] Auth OK`);

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      console.log(`[POST /players] FAIL: Invalid JSON body`);
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { firstName, lastName, game } = body as Record<string, unknown>;

    console.log(`[POST /players] Body parsed:`, { firstName, lastName, game });

    try {
      const playerId = await ctx.runMutation(api.players.registerPlayer, {
        firstName: String(firstName ?? ""),
        lastName: String(lastName ?? ""),
        game: String(game ?? ""),
      });

      console.log(`[POST /players] OK: playerId=${playerId}`);
      return new Response(JSON.stringify({ id: playerId }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Internal server error";
      console.log(`[POST /players] FAIL: ${message}`);
      return new Response(JSON.stringify({ error: message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  }),
});

export default http;
