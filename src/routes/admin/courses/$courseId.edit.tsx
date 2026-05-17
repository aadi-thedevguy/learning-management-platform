import { NotFoundComponent } from "@/components/NotFoundComponent";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { asc, eq } from "drizzle-orm";
import { EyeClosed, PlusIcon } from "lucide-react";
import { z } from "zod";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { db } from "@/drizzle/db";
import { CourseSectionTable, CourseTable, LessonTable } from "@/drizzle/schema";
import { SectionFormDialog } from "@/features/courseSections/components/SectionFormDialog";
import { SortableSectionList } from "@/features/courseSections/components/SortableSectionList";
import { CourseForm } from "@/features/courses/components/CourseForm";
import { LessonFormDialog } from "@/features/lessons/components/LessonFormDialog";
import { SortableLessonList } from "@/features/lessons/components/SortableLessonList";
import { cn } from "@/lib/utils";

export const getCourse = createServerFn()
	.inputValidator(z.object({ courseId: z.string() }))
	.handler(async ({ data }) => {
		const course = await db.query.CourseTable.findFirst({
			columns: { id: true, name: true, description: true },
			where: eq(CourseTable.id, data.courseId),
			with: {
				courseSections: {
					orderBy: asc(CourseSectionTable.order),
					columns: { id: true, status: true, name: true },
					with: {
						lessons: {
							orderBy: asc(LessonTable.order),
							columns: {
								id: true,
								name: true,
								status: true,
								description: true,
								youtubeVideoId: true,
								sectionId: true,
							},
						},
					},
				},
			},
		});

		if (!course) throw notFound();
		return course;
	});

export const Route = createFileRoute("/admin/courses/$courseId/edit")({
	loader: ({ params }) => getCourse({ data: params }),
	component: EditCoursePage,
	notFoundComponent: () => <NotFoundComponent />,
});

function EditCoursePage() {
	const course = Route.useLoaderData();

	return (
		<>
			<PageHeader title={course.name} />
			<Tabs defaultValue="lessons">
				<TabsList>
					<TabsTrigger value="lessons">Lessons</TabsTrigger>
					<TabsTrigger value="details">Details</TabsTrigger>
				</TabsList>
				<TabsContent value="lessons" className="flex flex-col gap-2">
					<Card>
						<CardHeader className="flex items-center flex-row justify-between">
							<CardTitle>Sections</CardTitle>
							<SectionFormDialog courseId={course.id}>
								<DialogTrigger asChild>
									<Button variant="outline">
										<PlusIcon /> New Section
									</Button>
								</DialogTrigger>
							</SectionFormDialog>
						</CardHeader>
						<CardContent>
							<SortableSectionList
								courseId={course.id}
								sections={course.courseSections}
							/>
						</CardContent>
					</Card>
					<hr className="my-2" />
					{course.courseSections.map((section) => (
						<Card key={section.id}>
							<CardHeader className="flex items-center flex-row justify-between gap-4">
								<CardTitle
									className={cn(
										"flex items-center gap-2",
										section.status === "private" && "text-muted-foreground",
									)}
								>
									{section.status === "private" && <EyeClosed />} {section.name}
								</CardTitle>
								<LessonFormDialog
									defaultSectionId={section.id}
									sections={course.courseSections}
								>
									<DialogTrigger asChild>
										<Button variant="outline">
											<PlusIcon /> New Lesson
										</Button>
									</DialogTrigger>
								</LessonFormDialog>
							</CardHeader>
							<CardContent>
								<SortableLessonList
									sections={course.courseSections}
									lessons={section.lessons}
								/>
							</CardContent>
						</Card>
					))}
				</TabsContent>
				<TabsContent value="details">
					<Card>
						<CardHeader>
							<CourseForm course={course} />
						</CardHeader>
					</Card>
				</TabsContent>
			</Tabs>
		</>
	);
}
