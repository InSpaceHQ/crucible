/// <reference types="vite/client" />
// @vitest-environment edge-runtime

import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");

test("create inserts a schedule item and listByCreation returns it", async () => {
  const t = convexTest(schema, modules);

  await t.mutation(api.schedule.create, {
    activity: "Opening Ceremony",
    description: "Kick off the event",
    timestamp: 1720000000000,
  });

  const items = await t.query(api.schedule.listByCreation);
  expect(items).toHaveLength(1);
  expect(items[0].activity).toBe("Opening Ceremony");
});

test("listByTimestamp returns items ordered by timestamp ascending", async () => {
  const t = convexTest(schema, modules);

  await t.mutation(api.schedule.create, {
    activity: "Later Event",
    description: "Happens second",
    timestamp: 1720000000000,
  });
  await t.mutation(api.schedule.create, {
    activity: "Earlier Event",
    description: "Happens first",
    timestamp: 1710000000000,
  });

  const items = await t.query(api.schedule.listByTimestamp);
  expect(items).toHaveLength(2);
  expect(items[0].activity).toBe("Earlier Event");
  expect(items[1].activity).toBe("Later Event");
});

test("update modifies an existing schedule item", async () => {
  const t = convexTest(schema, modules);

  await t.mutation(api.schedule.create, {
    activity: "Old Name",
    description: "Old description",
    timestamp: 1710000000000,
  });

  const [item] = await t.query(api.schedule.listByTimestamp);

  await t.mutation(api.schedule.update, {
    id: item._id,
    activity: "New Name",
    link: "https://example.com",
    linkLabel: "Watch Live",
  });

  const [updated] = await t.query(api.schedule.listByTimestamp);
  expect(updated.activity).toBe("New Name");
  expect(updated.link).toBe("https://example.com");
  expect(updated.linkLabel).toBe("Watch Live");
});

test("remove deletes a schedule item", async () => {
  const t = convexTest(schema, modules);

  await t.mutation(api.schedule.create, {
    activity: "To Delete",
    description: "Will be removed",
    timestamp: 1710000000000,
  });

  const [item] = await t.query(api.schedule.listByTimestamp);

  await t.mutation(api.schedule.remove, { id: item._id });

  const items = await t.query(api.schedule.listByTimestamp);
  expect(items).toHaveLength(0);
});

test("create accepts optional link and linkLabel fields", async () => {
  const t = convexTest(schema, modules);

  await t.mutation(api.schedule.create, {
    activity: "Stream Event",
    description: "Live stream",
    timestamp: 1710000000000,
    link: "https://twitch.tv/event",
    linkLabel: "Watch on Twitch",
  });

  const [item] = await t.query(api.schedule.listByTimestamp);
  expect(item.link).toBe("https://twitch.tv/event");
  expect(item.linkLabel).toBe("Watch on Twitch");
});
