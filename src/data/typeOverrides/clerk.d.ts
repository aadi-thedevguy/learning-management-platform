import { type UserRole } from "@/drizzle/schema";

declare global {
	interface CustomJwtSessionClaims {
		dbId?: string;
		role?: UserRole;
	}

	interface UserPublicMetadata {
		dbId?: string;
		role?: UserRole;
	}
}
