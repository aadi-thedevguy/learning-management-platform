import { NotFoundComponent } from "@/components/NotFoundComponent";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { PageHeader } from "@/components/PageHeader";
import { db } from "@/drizzle/db";
import { CourseTable } from "@/drizzle/schema";

export const getCourse = createServerFn()
	.inputValidator(z.object({ courseId: z.string() }))
	.handler(async ({ data }) => {
		const course = await db.query.CourseTable.findFirst({
			columns: { id: true, name: true, description: true },
			where: eq(CourseTable.id, data.courseId),
		});

		if (!course) throw notFound();
		return course;
	});

export const Route = createFileRoute("/_consumer/courses/$courseId")({
	loader: ({ params }) => getCourse({ data: params }),
	component: CoursePage,
	notFoundComponent: () => <NotFoundComponent />,
});

function CoursePage() {
	const course = Route.useLoaderData();

	return (
		<>
			<PageHeader className="mb-2" title={course.name} />
			<p className="text-muted-foreground">{course.description}</p>
		</>
	);
}
