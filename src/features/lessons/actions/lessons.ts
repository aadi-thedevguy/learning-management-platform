import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getCurrentUser } from "@/services/clerk";
import {
	deleteLesson as deleteLessonDb,
	getNextCourseLessonOrder,
	insertLesson,
	updateLesson as updateLessonDb,
	updateLessonOrders as updateLessonOrdersDb,
} from "../db/lessons";
import {
	canCreateLessons,
	canDeleteLessons,
	canUpdateLessons,
} from "../permissions/lessons";
import { lessonSchema } from "../schemas/lessons";

export const createLessonFn = createServerFn({ method: "POST" })
	.inputValidator(lessonSchema)
	.handler(async ({ data }) => {
		if (!canCreateLessons(await getCurrentUser())) {
			return {
				error: true,
				message: "There was an error creating your lesson",
			};
		}

		const order = await getNextCourseLessonOrder(data.sectionId);
		await insertLesson({ ...data, order });

		return { error: false, message: "Successfully created your lesson" };
	});

export const updateLessonFn = createServerFn({ method: "POST" })
	.inputValidator(z.object({ id: z.string(), values: lessonSchema }))
	.handler(async ({ data }) => {
		if (!canUpdateLessons(await getCurrentUser())) {
			return {
				error: true,
				message: "There was an error updating your lesson",
			};
		}

		await updateLessonDb(data.id, data.values);

		return { error: false, message: "Successfully updated your lesson" };
	});

export const deleteLessonFn = createServerFn({ method: "POST" })
	.inputValidator(z.object({ id: z.string() }))
	.handler(async ({ data }) => {
		if (!canDeleteLessons(await getCurrentUser())) {
			return { error: true, message: "Error deleting your lesson" };
		}

		await deleteLessonDb(data.id);

		return { error: false, message: "Successfully deleted your lesson" };
	});

export const updateLessonOrdersFn = createServerFn({ method: "POST" })
	.inputValidator(z.object({ lessonIds: z.array(z.string()) }))
	.handler(async ({ data }) => {
		if (
			data.lessonIds.length === 0 ||
			!canUpdateLessons(await getCurrentUser())
		) {
			return { error: true, message: "Error reordering your lessons" };
		}

		await updateLessonOrdersDb(data.lessonIds);

		return { error: false, message: "Successfully reordered your lessons" };
	});

export function createLesson(unsafeData: z.infer<typeof lessonSchema>) {
	return createLessonFn({ data: unsafeData });
}

export function updateLesson(
	id: string,
	unsafeData: z.infer<typeof lessonSchema>,
) {
	return updateLessonFn({ data: { id, values: unsafeData } });
}

export function deleteLesson(id: string) {
	return deleteLessonFn({ data: { id } });
}

export function updateLessonOrders(lessonIds: string[]) {
	return updateLessonOrdersFn({ data: { lessonIds } });
}
