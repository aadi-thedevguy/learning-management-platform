import { eq } from "drizzle-orm";
import type { UserRole } from "@/drizzle/schema";
import { CourseSectionTable } from "@/drizzle/schema";

export function canCreateCourseSections({
	role,
}: {
	role: UserRole | undefined;
}) {
	return role === "admin";
}

export function canUpdateCourseSections({
	role,
}: {
	role: UserRole | undefined;
}) {
	return role === "admin";
}

export function canDeleteCourseSections({
	role,
}: {
	role: UserRole | undefined;
}) {
	return role === "admin";
}

export const wherePublicCourseSections = eq(
	CourseSectionTable.status,
	"public",
);
