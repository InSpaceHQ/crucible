/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as fixtures from "../fixtures.js";
import type * as playerStats from "../playerStats.js";
import type * as pointsLog from "../pointsLog.js";
import type * as schedule from "../schedule.js";
import type * as seed from "../seed.js";
import type * as seedFixtures from "../seedFixtures.js";
import type * as seedPlayerStats from "../seedPlayerStats.js";
import type * as seedPointsLog from "../seedPointsLog.js";
import type * as seedSchedule from "../seedSchedule.js";
import type * as skills from "../skills.js";
import type * as standings from "../standings.js";
import type * as teams from "../teams.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  fixtures: typeof fixtures;
  playerStats: typeof playerStats;
  pointsLog: typeof pointsLog;
  schedule: typeof schedule;
  seed: typeof seed;
  seedFixtures: typeof seedFixtures;
  seedPlayerStats: typeof seedPlayerStats;
  seedPointsLog: typeof seedPointsLog;
  seedSchedule: typeof seedSchedule;
  skills: typeof skills;
  standings: typeof standings;
  teams: typeof teams;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
