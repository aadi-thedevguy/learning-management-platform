import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getCurrentUser } from "@/services/clerk";
import { deleteCourseDb, insertCourse, updateCourseDb } from "../db/courses";
import {
  canCreateCourses,
  canDeleteCourses,
  canUpdateCourses,
} from "../permissions/courses";
import { courseSchema } from "../schemas/courses";

const createCourseFn = createServerFn({ method: "POST" })
  .inputValidator(courseSchema)
  .handler(async ({ data }) => {
    try {
      if (!canCreateCourses(await getCurrentUser())) {
        return {
          error: true,
          message: "There was an error creating your course",
        };
      }

      const course = await insertCourse(data);

      return {
        error: false,
        message: "Successfully created your course",
        data: { courseId: course.id },
      };
    } catch (error) {
      console.error("Failed to add course:", error);
      if (error instanceof Error) {
        return {
          error: true,
          message: error.message,
          data: {},
        };
      }
      return {
        error: true,
        message: "Failed to add course",
        data: {},
      };
    }
  });

const updateCourseFn = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      id: z.string(),
      values: courseSchema,
    }),
  )
  .handler(async ({ data }) => {
    try {
      if (!canUpdateCourses(await getCurrentUser())) {
        return {
          error: true,
          message: "There was an error updating your course",
        };
      }

      await updateCourseDb(data.id, data.values);

      return {
        error: false,
        message: "Successfully updated your course",
        data: {},
      };
    } catch (error) {
      console.error("Failed to update course:", error);
      if (error instanceof Error) {
        // throw new Error(error.message);
        return {
          error: true,
          message: error.message,
          data: {},
        };
      }
      return {
        error: true,
        message: "Failed to update course",
        data: {},
      };
    }
  });

const deleteCourseFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    try {
      if (!canDeleteCourses(await getCurrentUser())) {
        return { error: true, message: "Error deleting your course" };
      }
      await deleteCourseDb(data.id);
      return {
        error: false,
        message: "Successfully deleted your course",
      };
    } catch (error) {
      console.error("Failed to delete course:", error);
      if (error instanceof Error) {
        return {
          error: true,
          message: error.message,
        };
      }
      return {
        error: true,
        message: "Failed to delete course",
      };
    }
  });

export function createCourse(unsafeData: z.infer<typeof courseSchema>) {
  return createCourseFn({ data: unsafeData });
}

export function updateCourse(
  id: string,
  unsafeData: z.infer<typeof courseSchema>,
) {
  return updateCourseFn({ data: { id, values: unsafeData } });
}

export function deleteCourse(id: string) {
  return deleteCourseFn({ data: { id } });
}
