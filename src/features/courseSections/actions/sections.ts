import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getCurrentUser } from "@/services/clerk";
import {
  deleteSection as deleteSectionDb,
  getNextCourseSectionOrder,
  insertSection,
  updateSection as updateSectionDb,
  updateSectionOrders as updateSectionOrdersDb,
} from "../db/sections";
import {
  canCreateCourseSections,
  canDeleteCourseSections,
  canUpdateCourseSections,
} from "../permissions/sections";
import { sectionSchema } from "../schemas/sections";

const createSectionFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ courseId: z.string(), values: sectionSchema }))
  .handler(async ({ data }) => {
    try {
      if (!canCreateCourseSections(await getCurrentUser())) {
        return {
          error: true,
          message: "There was an error creating your section",
        };
      }

      const order = await getNextCourseSectionOrder(data.courseId);
      const section = await insertSection({
        ...data.values,
        courseId: data.courseId,
        order,
      });

      return {
        error: false,
        message: "Successfully created your section",
        data: { sectionId: section.id },
      };
    } catch (error) {
      console.error("Failed to add section:", error);
      if (error instanceof Error) {
        return {
          error: true,
          message: error.message,
          data: {},
        };
      }
      return {
        error: true,
        message: "Failed to add section",
        data: {},
      };
    }
  });

const updateSectionFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string(), values: sectionSchema }))
  .handler(async ({ data }) => {
    try {
      if (!canUpdateCourseSections(await getCurrentUser())) {
        return {
          error: true,
          message: "There was an error updating your section",
        };
      }

      await updateSectionDb(data.id, data.values);

      return {
        error: false,
        message: "Successfully updated your section",
        data: {},
      };
    } catch (error) {
      console.error("Failed to update section:", error);
      if (error instanceof Error) {
        return {
          error: true,
          message: error.message,
          data: {},
        };
      }
      return {
        error: true,
        message: "Failed to update section",
        data: {},
      };
    }
  });

const deleteSectionFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    try {
      if (!canDeleteCourseSections(await getCurrentUser())) {
        return { error: true, message: "Error deleting your section" };
      }

      await deleteSectionDb(data.id);

      return { error: false, message: "Successfully deleted your section" };
    } catch (error) {
      console.error("Failed to delete section:", error);
      if (error instanceof Error) {
        return {
          error: true,
          message: error.message,
        };
      }
      return {
        error: true,
        message: "Failed to delete section",
      };
    }
  });

const updateSectionOrdersFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ sectionIds: z.array(z.string()) }))
  .handler(async ({ data }) => {
    if (
      data.sectionIds.length === 0 ||
      !canUpdateCourseSections(await getCurrentUser())
    ) {
      return { error: true, message: "Error reordering your sections" };
    }

    await updateSectionOrdersDb(data.sectionIds);

    return { error: false, message: "Successfully reordered your sections" };
  });

export function createSection(
  courseId: string,
  unsafeData: z.infer<typeof sectionSchema>,
) {
  return createSectionFn({ data: { courseId, values: unsafeData } });
}

export function updateSection(
  id: string,
  unsafeData: z.infer<typeof sectionSchema>,
) {
  return updateSectionFn({ data: { id, values: unsafeData } });
}

export function deleteSection(id: string) {
  return deleteSectionFn({ data: { id } });
}

export function updateSectionOrders(sectionIds: string[]) {
  return updateSectionOrdersFn({ data: { sectionIds } });
}
