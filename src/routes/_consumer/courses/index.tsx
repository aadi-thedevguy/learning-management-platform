import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { and, countDistinct, eq } from "drizzle-orm";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { db } from "@/drizzle/db";
import {
	CourseSectionTable,
	CourseTable,
	LessonTable,
	UserCourseAccessTable,
	UserLessonCompleteTable,
} from "@/drizzle/schema";
import { wherePublicCourseSections } from "@/features/courseSections/permissions/sections";
import { wherePublicLessons } from "@/features/lessons/permissions/lessons";
import { formatPlural } from "@/lib/formatters";
import { getCurrentUser } from "@/services/clerk";

export const getUserCourses = createServerFn().handler(async () => {
	const { userId } = await getCurrentUser();
	if (!userId) throw redirect({ href: "/sign-in" });

	return db
		.select({
			id: CourseTable.id,
			name: CourseTable.name,
			description: CourseTable.description,
			sectionsCount: countDistinct(CourseSectionTable.id),
			lessonsCount: countDistinct(LessonTable.id),
			lessonsComplete: countDistinct(UserLessonCompleteTable.lessonId),
		})
		.from(CourseTable)
		.leftJoin(
			UserCourseAccessTable,
			and(
				eq(UserCourseAccessTable.courseId, CourseTable.id),
				eq(UserCourseAccessTable.userId, userId),
			),
		)
		.leftJoin(
			CourseSectionTable,
			and(
				eq(CourseSectionTable.courseId, CourseTable.id),
				wherePublicCourseSections,
			),
		)
		.leftJoin(
			LessonTable,
			and(eq(LessonTable.sectionId, CourseSectionTable.id), wherePublicLessons),
		)
		.leftJoin(
			UserLessonCompleteTable,
			and(
				eq(UserLessonCompleteTable.lessonId, LessonTable.id),
				eq(UserLessonCompleteTable.userId, userId),
			),
		)
		.orderBy(CourseTable.name)
		.groupBy(CourseTable.id);
});

export const Route = createFileRoute("/_consumer/courses/")({
	loader: () => getUserCourses(),
	component: CoursesPage,
});

function CoursesPage() {
	const courses = Route.useLoaderData();

	return (
		<>
			<PageHeader title="My Courses" />
			<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
				{courses.length === 0 ? (
					<div className="flex flex-col gap-2 items-start">
						You have no courses yet
						<Button asChild size="lg">
							<Link to="/">Browse Courses</Link>
						</Button>
					</div>
				) : (
					courses.map((course) => (
						<Card key={course.id} className="overflow-hidden flex flex-col">
							<CardHeader>
								<CardTitle>{course.name}</CardTitle>
								<CardDescription>
									{formatPlural(course.sectionsCount, {
										plural: "sections",
										singular: "section",
									})}{" "}
									-{" "}
									{formatPlural(course.lessonsCount, {
										plural: "lessons",
										singular: "lesson",
									})}
								</CardDescription>
							</CardHeader>
							<CardContent className="line-clamp-3" title={course.description}>
								{course.description}
							</CardContent>
							<div className="grow" />
							<CardFooter>
								<Button asChild>
									<Link
										to="/courses/$courseId"
										params={{ courseId: course.id }}
									>
										View Course
									</Link>
								</Button>
							</CardFooter>
							<div
								className="bg-accent h-2 -mt-2"
								style={{
									width:
										course.lessonsCount > 0
											? `${(course.lessonsComplete / course.lessonsCount) * 100}%`
											: "0%",
								}}
							/>
						</Card>
					))
				)}
			</div>
		</>
	);
}
