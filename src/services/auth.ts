import { redirect } from "@tanstack/react-router";
import { eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import type { UserRole } from "@/drizzle/schema";
import { UserTable } from "@/drizzle/schema";
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

	const dbUser = allData ? await getUser(session.user.id) : undefined;

	return {
		authUserId: session.user.id,
		userId: session.user.id,
		role: (session.user.role as UserRole | undefined) ?? dbUser?.role,
		user: dbUser,
		redirectToSignIn: () => redirect({ to: "/login" }),
	};
}

export async function getUser(id: string) {
	return db.query.UserTable.findFirst({
		where: eq(UserTable.id, id),
	});
}
