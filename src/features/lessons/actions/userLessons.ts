import { createServerFn } from "@tanstack/react-start";
import { getCurrentUser } from "@/services/clerk";
import { updateLessonCompleteStatus as updateLessonCompleteStatusDb } from "../db/userLessonComplete";
import { canUpdateUserLessonCompleteStatus } from "../permissions/userLessonComplete";
import { and, asc, desc, eq, gt, lt } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/drizzle/db";
import {
  CourseSectionTable,
  LessonTable,
  UserLessonCompleteTable,
} from "@/drizzle/schema";
import { wherePublicCourseSections } from "@/features/courseSections/permissions/sections";
import {
  canViewLesson as canViewLessonPerm,
  wherePublicLessons,
} from "@/features/lessons/permissions/lessons";

export const updateLessonCompleteStatus = createServerFn({ method: "POST" })
  .inputValidator(z.object({ lessonId: z.string(), complete: z.boolean() }))
  .handler(async ({ data }) => {
    try {
      const { userId } = await getCurrentUser();

      if (!userId) {
        return {
          error: true,
          message: "User not authenticated",
        };
      }

      const hasPermission = await canUpdateUserLessonCompleteStatus(
        userId,
        data.lessonId,
      );

      if (userId == null || !hasPermission) {
        return {
          error: true,
          message: "Error updating lesson completion status",
        };
      }

      await updateLessonCompleteStatusDb({
        lessonId: data.lessonId,
        userId,
        complete: data.complete,
      });

      return {
        error: false,
        message: "Successfully updated lesson completion status",
      };
    } catch (error) {
      console.error("Failed to update lesson completion status:", error);
      if (error instanceof Error) {
        return {
          error: true,
          message: error.message,
        };
      }
      return {
        error: true,
        message: "Failed to update lesson completion status",
      };
    }
  });

export const getLesson = createServerFn()
  .inputValidator(z.object({ courseId: z.string(), lessonId: z.string() }))
  .handler(async ({ data }) => {
    const lesson = await db.query.LessonTable.findFirst({
      columns: {
        id: true,
        youtubeVideoId: true,
        name: true,
        description: true,
        status: true,
        sectionId: true,
        order: true,
      },
      where: and(eq(LessonTable.id, data.lessonId), wherePublicLessons),
    });

    if (!lesson) throw new Error("Lesson not found");

    const { userId, role } = await getCurrentUser();
    const canView = await canViewLessonPerm({ role, userId }, lesson);
    const canUpdateCompletionStatus = await canUpdateUserLessonCompleteStatus(
      userId,
      lesson.id,
    );

    const isLessonComplete =
      userId == null
        ? false
        : (await db.query.UserLessonCompleteTable.findFirst({
            where: and(
              eq(UserLessonCompleteTable.userId, userId),
              eq(UserLessonCompleteTable.lessonId, lesson.id),
            ),
          })) != null;

    return {
      lesson,
      courseId: data.courseId,
      canView,
      canUpdateCompletionStatus,
      isLessonComplete,
    };
  });

export const getIsLessonComplete = createServerFn()
  .inputValidator(z.object({ userId: z.string(), lessonId: z.string() }))
  .handler(async ({ data }) => {
    const completedLesson = await db.query.UserLessonCompleteTable.findFirst({
      where: and(
        eq(UserLessonCompleteTable.userId, data.userId),
        eq(UserLessonCompleteTable.lessonId, data.lessonId),
      ),
    });
    return completedLesson != null;
  });

export const getPreviousLesson = createServerFn()
  .inputValidator(
    z.object({ id: z.string(), sectionId: z.string(), order: z.number() }),
  )
  .handler(async ({ data: lesson }) => {
    let previousLesson = await db.query.LessonTable.findFirst({
      where: and(
        lt(LessonTable.order, lesson.order),
        eq(LessonTable.sectionId, lesson.sectionId),
        wherePublicLessons,
      ),
      orderBy: desc(LessonTable.order),
      columns: { id: true },
    });

    if (previousLesson == null) {
      const section = await db.query.CourseSectionTable.findFirst({
        where: eq(CourseSectionTable.id, lesson.sectionId),
        columns: { order: true, courseId: true },
      });

      if (section == null) return;

      const previousSection = await db.query.CourseSectionTable.findFirst({
        where: and(
          lt(CourseSectionTable.order, section.order),
          eq(CourseSectionTable.courseId, section.courseId),
          wherePublicCourseSections,
        ),
        orderBy: desc(CourseSectionTable.order),
        columns: { id: true },
      });

      if (previousSection == null) return;

      previousLesson = await db.query.LessonTable.findFirst({
        where: and(
          eq(LessonTable.sectionId, previousSection.id),
          wherePublicLessons,
        ),
        orderBy: desc(LessonTable.order),
        columns: { id: true },
      });
    }
    return previousLesson;
  });

export const getNextLesson = createServerFn()
  .inputValidator(
    z.object({ id: z.string(), sectionId: z.string(), order: z.number() }),
  )
  .handler(async ({ data: lesson }) => {
    let nextLesson = await db.query.LessonTable.findFirst({
      where: and(
        gt(LessonTable.order, lesson.order),
        eq(LessonTable.sectionId, lesson.sectionId),
        wherePublicLessons,
      ),
      orderBy: asc(LessonTable.order),
      columns: { id: true },
    });

    if (nextLesson == null) {
      const section = await db.query.CourseSectionTable.findFirst({
        where: eq(CourseSectionTable.id, lesson.sectionId),
        columns: { order: true, courseId: true },
      });

      if (section == null) return;

      const nextSection = await db.query.CourseSectionTable.findFirst({
        where: and(
          gt(CourseSectionTable.order, section.order),
          eq(CourseSectionTable.courseId, section.courseId),
          wherePublicCourseSections,
        ),
        orderBy: asc(CourseSectionTable.order),
        columns: { id: true },
      });

      if (nextSection == null) return;

      nextLesson = await db.query.LessonTable.findFirst({
        where: and(
          eq(LessonTable.sectionId, nextSection.id),
          wherePublicLessons,
        ),
        orderBy: asc(LessonTable.order),
        columns: { id: true },
      });
    }
    return nextLesson;
  });
