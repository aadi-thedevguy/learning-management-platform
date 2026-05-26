import { and, eq, or } from "drizzle-orm";
import { db } from "@/drizzle/db";
import type { LessonStatus, UserRole } from "@/drizzle/schema";
import {
  CourseSectionTable,
  CourseTable,
  LessonTable,
  UserCourseAccessTable,
} from "@/drizzle/schema";
import { wherePublicCourseSections } from "@/features/courseSections/permissions/sections";
import { getUserCourseAccessUserTag } from "@/features/courses/db/cache/userCourseAccess";
import { cacheTag } from "@/shims/next-cache-tag";
import { getLessonIdTag } from "../db/cache/lessons";

export function canCreateLessons({ role }: { role: UserRole | undefined }) {
  return role === "admin";
}

export function canUpdateLessons({ role }: { role: UserRole | undefined }) {
  return role === "admin";
}

export function canDeleteLessons({ role }: { role: UserRole | undefined }) {
  return role === "admin";
}

export async function canViewLesson(
  {
    role,
    userId,
  }: {
    userId: string | undefined;
    role: UserRole | undefined;
  },
  lesson: { id: string; status: LessonStatus },
) {
  if (role === "admin" || lesson.status === "preview") return true;
  if (userId == null || lesson.status === "private") return false;

  cacheTag(getUserCourseAccessUserTag(userId), getLessonIdTag(lesson.id));

  const [data] = await db
    .select({ courseId: CourseTable.id })
    .from(UserCourseAccessTable)
    .leftJoin(CourseTable, eq(CourseTable.id, UserCourseAccessTable.courseId))
    .leftJoin(
      CourseSectionTable,
      and(
        eq(CourseSectionTable.courseId, CourseTable.id),
        wherePublicCourseSections,
      ),
    )
    .leftJoin(
      LessonTable,
      and(eq(LessonTable.sectionId, CourseSectionTable.id), wherePublicLessons),
    )
    .where(
      and(
        eq(LessonTable.id, lesson.id),
        eq(UserCourseAccessTable.userId, userId),
      ),
    )
    .limit(1);

  return data != null && data.courseId != null;
}

export const wherePublicLessons = or(
  eq(LessonTable.status, "public"),
  eq(LessonTable.status, "preview"),
);
