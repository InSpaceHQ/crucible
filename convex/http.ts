import { httpRouter } from "convex/server";
import { z } from "zod";
import { api } from "./_generated/api";
import { httpAction } from "./_generated/server";
import { setExternalId } from "./clerk";

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

const schema = z.object({
  id: z.string().refine((e) => e.startsWith("user_")),
  first_name: z.string().min(2).max(100),
  last_name: z.string().min(2).max(100),
  email_addresses: z
    .array(z.object({ email_address: z.string().email() }))
    .min(1),
  phone_numbers: z.array(
    z.object({
      phone_number: z.string().min(10).max(20),
    }),
  ),
});

const handleEvents = httpAction(async (ctx, res) => {
  const event = await res.json();

  if (event.type === "user.created") {
    console.info("User signed up");
    const clerk_user = await schema.parseAsync(event?.data);

    console.info("Updating Convex user database");
    const convex_user_id = await ctx.runMutation(api.users.createUser, {
      email: clerk_user.email_addresses[0].email_address,
      firstName: clerk_user.first_name,
      lastName: clerk_user.last_name,
      phone: clerk_user.phone_numbers?.[0]?.phone_number ?? undefined,
    });

    console.info("Linking Convex User to Clerk User", clerk_user.id);

    await setExternalId({
      clerkUserId: clerk_user.id,
      convexUserId: convex_user_id,
    });

    console.info("Linked Convex User to Clerk User");
    return Response.json({ message: "OK", data: "User linking complete" });
  }

  return Response.json({ message: "OK" });
});

http.route({
  method: "POST",
  path: "/events/convex",
  handler: handleEvents,
});

export default http;
