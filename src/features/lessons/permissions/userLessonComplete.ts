import { and, eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
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
import { wherePublicLessons } from "./lessons";

export async function canUpdateUserLessonCompleteStatus(
  userId: string | undefined,
  lessonId: string,
) {
  cacheTag(getLessonIdTag(lessonId));
  if (!userId) return false;

  cacheTag(getUserCourseAccessUserTag(userId));

  const [courseAccess] = await db
    .select({ courseId: CourseTable.id })
    .from(UserCourseAccessTable)
    .innerJoin(CourseTable, eq(CourseTable.id, UserCourseAccessTable.courseId))
    .innerJoin(
      CourseSectionTable,
      and(
        eq(CourseSectionTable.courseId, CourseTable.id),
        wherePublicCourseSections,
      ),
    )
    .innerJoin(
      LessonTable,
      and(eq(LessonTable.sectionId, CourseSectionTable.id), wherePublicLessons),
    )
    .where(
      and(
        eq(LessonTable.id, lessonId),
        eq(UserCourseAccessTable.userId, userId),
      ),
    )
    .limit(1);

  return courseAccess != null;
}
