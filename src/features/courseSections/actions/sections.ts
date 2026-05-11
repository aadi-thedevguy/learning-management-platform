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

export const createSectionFn = createServerFn({ method: "POST" })
	.inputValidator(z.object({ courseId: z.string(), values: sectionSchema }))
	.handler(async ({ data }) => {
		if (!canCreateCourseSections(await getCurrentUser())) {
			return {
				error: true,
				message: "There was an error creating your section",
			};
		}

		const order = await getNextCourseSectionOrder(data.courseId);
		await insertSection({ ...data.values, courseId: data.courseId, order });

		return { error: false, message: "Successfully created your section" };
	});

export const updateSectionFn = createServerFn({ method: "POST" })
	.inputValidator(z.object({ id: z.string(), values: sectionSchema }))
	.handler(async ({ data }) => {
		if (!canUpdateCourseSections(await getCurrentUser())) {
			return {
				error: true,
				message: "There was an error updating your section",
			};
		}

		await updateSectionDb(data.id, data.values);

		return { error: false, message: "Successfully updated your section" };
	});

export const deleteSectionFn = createServerFn({ method: "POST" })
	.inputValidator(z.object({ id: z.string() }))
	.handler(async ({ data }) => {
		if (!canDeleteCourseSections(await getCurrentUser())) {
			return { error: true, message: "Error deleting your section" };
		}

		await deleteSectionDb(data.id);

		return { error: false, message: "Successfully deleted your section" };
	});

export const updateSectionOrdersFn = createServerFn({ method: "POST" })
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
