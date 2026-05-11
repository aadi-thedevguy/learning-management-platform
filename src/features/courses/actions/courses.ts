import { redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getCurrentUser } from "@/services/clerk";
import {
	deleteCourse as deleteCourseDB,
	insertCourse,
	updateCourse as updateCourseDb,
} from "../db/courses";
import {
	canCreateCourses,
	canDeleteCourses,
	canUpdateCourses,
} from "../permissions/courses";
import { courseSchema } from "../schemas/courses";

export const createCourseFn = createServerFn({ method: "POST" })
	.inputValidator(courseSchema)
	.handler(async ({ data }) => {
		if (!canCreateCourses(await getCurrentUser())) {
			return {
				error: true,
				message: "There was an error creating your course",
			};
		}

		const course = await insertCourse(data);

		throw redirect({ href: `/admin/courses/${course.id}/edit` });
	});

export const updateCourseFn = createServerFn({ method: "POST" })
	.inputValidator(
		z.object({
			id: z.string(),
			values: courseSchema,
		}),
	)
	.handler(async ({ data }) => {
		if (!canUpdateCourses(await getCurrentUser())) {
			return {
				error: true,
				message: "There was an error updating your course",
			};
		}

		await updateCourseDb(data.id, data.values);

		return { error: false, message: "Successfully updated your course" };
	});

export const deleteCourseFn = createServerFn({ method: "POST" })
	.inputValidator(z.object({ id: z.string() }))
	.handler(async ({ data }) => {
		if (!canDeleteCourses(await getCurrentUser())) {
			return { error: true, message: "Error deleting your course" };
		}

		await deleteCourseDB(data.id);

		return { error: false, message: "Successfully deleted your course" };
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
