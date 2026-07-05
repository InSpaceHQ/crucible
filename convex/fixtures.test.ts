/// <reference types="vite/client" />
// @vitest-environment edge-runtime

import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");

test("updateScore increments and decrements an entry's score", async () => {
  const t = convexTest(schema, modules);

  const { fixtureId } = await t.run(async (ctx) => {
    const gameId = await ctx.db.insert("games", {
      name: "FC26",
      displayName: "FC26",
    });
    const teamId = await ctx.db.insert("teams", {
      name: "Nova",
      gameId,
      logo: "/logos/nova.png",
      order: 0,
    });
    const player1Id = await ctx.db.insert("players", {
      name: "Aisha Khan",
      gameId,
      teamId,
    });
    const player2Id = await ctx.db.insert("players", {
      name: "Zara Patel",
      gameId,
      teamId,
    });
    const fixtureId = await ctx.db.insert("fixtures", {
      gameId,
      startTime: 0,
      endTime: 60000,
      entries: [
        { playerId: player1Id, score: 0 },
        { playerId: player2Id, score: 0 },
      ],
    });
    return { fixtureId };
  });

  // increment p1
  await t.mutation(api.fixtures.updateScore, {
    fixtureId,
    entryIndex: 0,
    delta: 1,
  });
  let f = await t.query(api.fixtures.list);
  expect(f[0].entries[0].score).toBe(1);
  expect(f[0].entries[1].score).toBe(0);

  // decrement p1
  await t.mutation(api.fixtures.updateScore, {
    fixtureId,
    entryIndex: 0,
    delta: -1,
  });
  f = await t.query(api.fixtures.list);
  expect(f[0].entries[0].score).toBe(0);

  // cannot go below 0
  await t.mutation(api.fixtures.updateScore, {
    fixtureId,
    entryIndex: 0,
    delta: -5,
  });
  f = await t.query(api.fixtures.list);
  expect(f[0].entries[0].score).toBe(0);

  // only the specified entry changes
  await t.mutation(api.fixtures.updateScore, {
    fixtureId,
    entryIndex: 1,
    delta: 3,
  });
  f = await t.query(api.fixtures.list);
  expect(f[0].entries[0].score).toBe(0);
  expect(f[0].entries[1].score).toBe(3);
});

test("updateScore throws on nonexistent fixture", async () => {
  const t = convexTest(schema, modules);

  const { fixtureId } = await t.run(async (ctx) => {
    const gameId = await ctx.db.insert("games", {
      name: "FC26",
      displayName: "FC26",
    });
    const teamId = await ctx.db.insert("teams", {
      name: "Nova",
      gameId,
      logo: "/logos/nova.png",
      order: 0,
    });
    const playerId = await ctx.db.insert("players", {
      name: "Aisha Khan",
      gameId,
      teamId,
    });
    const fixtureId = await ctx.db.insert("fixtures", {
      gameId,
      startTime: 0,
      endTime: 60000,
      entries: [
        { playerId, score: 0 },
        { playerId, score: 0 },
      ],
    });
    await ctx.db.delete("fixtures", fixtureId);
    return { fixtureId };
  });

  await expect(
    t.mutation(api.fixtures.updateScore, {
      fixtureId,
      entryIndex: 0,
      delta: 1,
    }),
  ).rejects.toThrow("Fixture not found");
});
