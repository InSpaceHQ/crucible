import { type GenericQueryCtx } from "convex/server";
import { ConvexError, v } from "convex/values";
import { z } from "zod";
import { api, internal } from "./_generated/api";
import type { DataModel, Doc, Id } from "./_generated/dataModel";
import { action, internalMutation, mutation, query } from "./_generated/server";
import { setExternalId, updateClerkUser } from "./clerk";

export const authUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();

    return identity;
  },
});

export const setAccountExternalId = action({
  args: {
    clerk_user_id: v.string(),
    convex_user_id: v.string(),
  },
  async handler(_ctx, args) {
    await setExternalId({
      clerkUserId: args.clerk_user_id,
      convexUserId: args.convex_user_id,
    });
  },
});

export const createUser = mutation({
  args: {
    email: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .unique();

    if (user) {
      return user._id;
    }

    const user_id = await ctx.db.insert("users", {
      email: args.email,
      emailVerificationTime: Date.now(),
      phone: args.phone,
      isAnonymous: false,
      name: `${args.firstName} ${args.lastName}`,
    });

    const profile = await ctx.db
      .query("profile")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (profile) {
      await ctx.db.patch(profile._id, {
        id: user_id,
      });
    } else {
      await ctx.db.insert("profile", {
        id: user_id,
        email: args.email,
        firstName: args.firstName,
        lastName: args.lastName,
        occupation: "None",
        phoneNumber: args.phone,
        role: "user",
      });
    }

    return user_id;
  },
});

export const getAccountMeta = query({
  handler: async (ctx) => {
    const ident = await ctx.auth.getUserIdentity();

    if (!ident?.email) return null;

    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), ident.email))
      .unique();

    const profile = await ctx.db
      .query("profile")
      .filter((q) => q.eq(q.field("id"), user?._id))
      .unique();

    return { user, profile };
  },
});

export const getProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await readId(ctx);

    if (userId === null) return null;

    return await ctx.db
      .query("profile")
      .filter((q) => q.eq(q.field("id"), userId))
      .first();
  },
});

export const getUserById = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("profile")
      .withIndex("by_user_id", (q) => q.eq("id", args.userId))
      .unique();

    return user;
  },
});

export async function readId(
  ctx: GenericQueryCtx<DataModel>,
): Promise<Id<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();

  const userId = identity?.profile_id ?? null;

  if (userId == null) return null;

  return String(userId) as Id<"users">;
}

export const updateUser = action({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    phoneNumber: v.string(),
    occupation: v.union(v.id("occupations"), v.literal("None")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      console.warn("User not authenticated");
      return null;
    }

    await updateClerkUser({
      userId: identity.subject,
      firstName: args.firstName,
      lastName: args.lastName,
    });

    if (!identity.email) {
      throw new ConvexError("Email required to update account");
    }

    await ctx.runMutation(api.auth.createOrUpdateProfile, {
      firstName: args.firstName,
      lastName: args.lastName,
      email: identity.email,
      phoneNumber: args.phoneNumber,
      occupation: args.occupation,
    });
  },
});

export const authGuard = async (
  ctx: GenericQueryCtx<DataModel>,
  requiredRole?: string,
) => {
  const identity = await ctx.auth.getUserIdentity();
  const userId = identity?.profile_id ?? null;

  if (!userId) {
    console.warn("User not authenticated");
    return null;
  }

  const profile = await ctx.runQuery(api.users.getProfile);
  if (!profile) return null;

  if (requiredRole && profile.role !== requiredRole) {
    console.warn(`User does not have the required role: ${requiredRole}`);
    return null;
  }

  return profile;
};

export const getAllProfiles = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();

    const _profiles: Array<{
      user: Doc<"users">;
      profile: Doc<"profile"> | null;
    }> = [];

    for await (const user of users) {
      const profile = await ctx.db
        .query("profile")
        .filter((q) => q.eq(q.field("id"), user._id))
        .unique();

      _profiles.push({
        user: user,
        profile: profile,
      });
    }

    return _profiles;
  },
});

export const updateProfile = internalMutation({
  args: {
    _id: v.id("profile"),
    firstName: v.string(),
    lastName: v.string(),
    phoneNumber: v.string(),
    occupation: v.union(v.id("occupations"), v.literal("None")),
  },
  handler: async (ctx, args) => {
    const record = await ctx.db.get(args._id);

    if (!record) {
      throw new ConvexError("Profile update failed!");
    }

    return await ctx.db.replace(args._id, {
      ...record,
      firstName: args.firstName,
      lastName: args.lastName,
      phoneNumber: args.phoneNumber,
      occupation: args.occupation ?? "None",
    });
  },
});

export const updateProfileRole = internalMutation({
  args: {
    profileId: v.id("profile"),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.profileId, { role: args.role });
  },
});
