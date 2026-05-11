import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { asc, countDistinct, eq } from "drizzle-orm";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { db } from "@/drizzle/db";
import {
	CourseSectionTable,
	CourseTable as DbCourseTable,
	LessonTable,
	UserCourseAccessTable,
} from "@/drizzle/schema";
import { CourseTable } from "@/features/courses/components/CourseTable";

export const getCourses = createServerFn().handler(async () => {
	return db
		.select({
			id: DbCourseTable.id,
			name: DbCourseTable.name,
			sectionsCount: countDistinct(CourseSectionTable),
			lessonsCount: countDistinct(LessonTable),
			studentsCount: countDistinct(UserCourseAccessTable),
		})
		.from(DbCourseTable)
		.leftJoin(
			CourseSectionTable,
			eq(CourseSectionTable.courseId, DbCourseTable.id),
		)
		.leftJoin(LessonTable, eq(LessonTable.sectionId, CourseSectionTable.id))
		.leftJoin(
			UserCourseAccessTable,
			eq(UserCourseAccessTable.courseId, DbCourseTable.id),
		)
		.orderBy(asc(DbCourseTable.name))
		.groupBy(DbCourseTable.id);
});

export const Route = createFileRoute("/admin/courses/")({
	loader: () => getCourses(),
	component: CoursesPage,
});

function CoursesPage() {
	const courses = Route.useLoaderData();

	return (
		<>
			<PageHeader title="Courses">
				<Button asChild>
					<Link to="/admin/courses/new">New Course</Link>
				</Button>
			</PageHeader>

			<CourseTable courses={courses} />
		</>
	);
}
