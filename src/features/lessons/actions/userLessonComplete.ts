import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getCurrentUser } from "@/services/clerk";
import { updateLessonCompleteStatus as updateLessonCompleteStatusDb } from "../db/userLessonComplete";
import { canUpdateUserLessonCompleteStatus } from "../permissions/userLessonComplete";

export const updateLessonCompleteStatusFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ lessonId: z.string(), complete: z.boolean() }))
  .handler(async ({ data }) => {
    try {
      const { userId } = await getCurrentUser();

      const hasPermission = await canUpdateUserLessonCompleteStatus(
        { userId },
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

export function updateLessonCompleteStatus(
  lessonId: string,
  complete: boolean,
) {
  return updateLessonCompleteStatusFn({ data: { lessonId, complete } });
}
