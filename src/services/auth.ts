import { redirect } from "@tanstack/react-router";
import { eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import type { UserRole } from "@/drizzle/schema";
import { UserTable } from "@/drizzle/schema";
import { upsertUser } from "@/features/users/db/users";
import { auth } from "@/lib/auth";
import { getRequestHeaders } from "@tanstack/react-start/server";

export async function getCurrentUser({ allData = false } = {}) {
	const headers = getRequestHeaders();
	const session = await auth.api.getSession({ headers });

	if (session == null) {
		return {
			authUserId: null as string | null,
			userId: undefined as string | undefined,
			role: undefined as UserRole | undefined,
			user: undefined,
			redirectToSignIn: () => redirect({ to: "/login" }),
		};
	}

	let dbUser =
		allData || session.user.role == null
			? await getUserByAuthId(session.user.id)
			: undefined;

	if (dbUser == null) {
		dbUser = await upsertUser({
			authUserId: session.user.id,
			email: session.user.email,
			name: session.user.name,
			imageUrl: session.user.image,
			role: (session.user.role as UserRole | undefined) || "user",
		});
	}

	return {
		authUserId: session.user.id,
		userId: dbUser.id,
		role: (session.user.role as UserRole | undefined) ?? dbUser.role,
		user: allData ? dbUser : undefined,
		redirectToSignIn: () => redirect({ to: "/login" }),
	};
}

export async function getUser(id: string) {
	return db.query.UserTable.findFirst({
		where: eq(UserTable.id, id),
	});
}

export async function getUserByAuthId(authUserId: string) {
	return db.query.UserTable.findFirst({
		where: eq(UserTable.authUserId, authUserId),
	});
}
