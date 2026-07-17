import { isNull } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { UserTable } from "@/drizzle/schema";
import { revalidateUserCache } from "./cache";

export async function upsertUser(data: typeof UserTable.$inferInsert) {
	const [user] = await db
		.insert(UserTable)
		.values(data)
		.returning()
		.onConflictDoUpdate({
			target: [UserTable.authUserId],
			set: data,
			where: isNull(UserTable.deletedAt),
		});

	if (user != null) {
		revalidateUserCache(user.id);
	}

	return user;
}

export async function deleteUser({ authUserId }: { authUserId: string }) {
	const [deletedUser] = await db
		.insert(UserTable)
		.values({
			authUserId,
			email: "redacted@deleted.com",
			name: "Deleted User",
			imageUrl: null,
			deletedAt: new Date(),
			role: "user",
		})
		.onConflictDoUpdate({
			target: [UserTable.authUserId],
			set: {
				deletedAt: new Date(),
				email: "redacted@deleted.com",
				name: "Deleted User",
				imageUrl: null,
			},
		})
		.returning();

	if (deletedUser != null) {
		// revalidateUserCache(deletedUser.id);
	}

	return deletedUser;
}
