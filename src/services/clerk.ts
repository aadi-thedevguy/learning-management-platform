import { auth, clerkClient } from "@clerk/tanstack-react-start/server";
import { redirect } from "@tanstack/react-router";
import { eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import type { UserRole } from "@/drizzle/schema";
import { UserTable } from "@/drizzle/schema";

export async function getCurrentUser({ allData = false } = {}) {
  const authState = await auth();
  const sessionClaims = authState.sessionClaims as
    | CustomJwtSessionClaims
    | undefined;

  if (authState.userId != null && sessionClaims?.dbId == null) {
    // Note: This might trigger if the webhook hasn't finished syncing yet.
    throw redirect({ to: "/sign-in/$" });
  }

  return {
    clerkUserId: authState.userId,
    userId: sessionClaims?.dbId,
    role: sessionClaims?.role,
    user:
      allData && sessionClaims?.dbId != null
        ? await getUser(sessionClaims.dbId)
        : undefined,
    redirectToSignIn: () => redirect({ to: "/sign-in/$" }),
  };
}

export async function syncClerkUserMetadata(user: {
  id: string;
  clerkUserId: string;
  role: UserRole;
}) {
  const client = clerkClient();

  return await client.users.updateUserMetadata(user.clerkUserId, {
    publicMetadata: {
      dbId: user.id,
      role: user.role,
    },
  });
}

export async function getUser(id: string) {
  return db.query.UserTable.findFirst({
    where: eq(UserTable.id, id),
  });
}
