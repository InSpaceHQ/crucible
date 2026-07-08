import { ConvexError, v } from "convex/values";
import { internal } from "./_generated/api";
import { action } from "./_generated/server";
import { findUserByEmail, updateMetadata } from "./clerk";

export const assignRole = action({
  args: {
    targetEmail: v.string(),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    const callerProfile = await ctx.runQuery(
      internal.auth.getProfileByEmailOrId,
      { email: identity.email ?? undefined },
    );
    if (!callerProfile || callerProfile.role !== "admin") {
      throw new ConvexError("Only admins can assign roles");
    }

    const clerkUsers = await findUserByEmail(args.targetEmail);
    const clerkUser = clerkUsers?.[0] as Record<string, unknown> | undefined;
    if (!clerkUser?.id) throw new ConvexError("Clerk user not found");

    await updateMetadata({
      clerkUserId: String(clerkUser.id),
      metadata: { private_metadata: { role: args.role } },
    });

    const targetProfile = await ctx.runQuery(
      internal.auth.getProfileByEmailOrId,
      { email: args.targetEmail },
    );
    if (targetProfile) {
      await ctx.runMutation(internal.users.updateProfileRole, {
        profileId: targetProfile._id,
        role: args.role,
      });
    }

    return { success: true };
  },
});
