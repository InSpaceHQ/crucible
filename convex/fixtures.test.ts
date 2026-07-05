/// <reference types="vite/client" />
// @vitest-environment edge-runtime

import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";
import type { Id } from "./_generated/dataModel";

const modules = import.meta.glob("./**/*.ts");

async function seedFixture(t: ReturnType<typeof convexTest>) {
  return t.run(async (ctx) => {
    const gameId = await ctx.db.insert("games", {
      name: "FC26",
      displayName: "FC26",
    });
    const teamId = await ctx.db.insert("teams", {
      name: "Nova",
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
    return { fixtureId } as { fixtureId: Id<"fixtures"> };
  });
}

test("increments entry score by delta", async () => {
  const t = convexTest(schema, modules);
  const { fixtureId } = await seedFixture(t);

  await t.mutation(api.fixtures.updateScore, {
    fixtureId,
    entryIndex: 0,
    delta: 1,
  });

  const [f] = await t.query(api.fixtures.list);
  expect(f.entries[0].score).toBe(1);
});

test("decrements entry score by delta", async () => {
  const t = convexTest(schema, modules);
  const { fixtureId } = await seedFixture(t);

  await t.mutation(api.fixtures.updateScore, {
    fixtureId,
    entryIndex: 0,
    delta: 3,
  });
  await t.mutation(api.fixtures.updateScore, {
    fixtureId,
    entryIndex: 0,
    delta: -1,
  });

  const [f] = await t.query(api.fixtures.list);
  expect(f.entries[0].score).toBe(2);
});

test("does not decrease score below zero", async () => {
  const t = convexTest(schema, modules);
  const { fixtureId } = await seedFixture(t);

  await t.mutation(api.fixtures.updateScore, {
    fixtureId,
    entryIndex: 0,
    delta: -1,
  });

  const [f] = await t.query(api.fixtures.list);
  expect(f.entries[0].score).toBe(0);
});

test("only updates the targeted entry", async () => {
  const t = convexTest(schema, modules);
  const { fixtureId } = await seedFixture(t);

  await t.mutation(api.fixtures.updateScore, {
    fixtureId,
    entryIndex: 1,
    delta: 3,
  });

  const [f] = await t.query(api.fixtures.list);
  expect(f.entries[0].score).toBe(0);
  expect(f.entries[1].score).toBe(3);
});

test("throws when fixture does not exist", async () => {
  const t = convexTest(schema, modules);
  const { fixtureId } = await seedFixture(t);

  await t.run(async (ctx) => {
    await ctx.db.delete("fixtures", fixtureId);
  });

  await expect(
    t.mutation(api.fixtures.updateScore, {
      fixtureId,
      entryIndex: 0,
      delta: 1,
    }),
  ).rejects.toThrow("Fixture not found");
});
