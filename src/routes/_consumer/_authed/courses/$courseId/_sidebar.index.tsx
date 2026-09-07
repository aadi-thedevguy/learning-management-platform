import { createFileRoute } from "@tanstack/react-router";
import { VideoPlayer } from "@/features/lessons/components/YouTubeVideoPlayer";
import { getCourseLayoutData } from "@/features/courses/actions/courses";
import { z } from "zod";

const searchSchema = z.object({
	lessonId: z.string().optional(),
});

export const Route = createFileRoute(
	"/_consumer/_authed/courses/$courseId/_sidebar/",
)({
	validateSearch: searchSchema,
	loader: ({ params }) => getCourseLayoutData({ data: params }),
	component: CourseLessonPage,
});

function CourseLessonPage() {
	const { course } = Route.useLoaderData();
	const { lessonId } = Route.useSearch();

	const lessons = course.courseSections.flatMap((section) => section.lessons);
	const selectedLesson = lessonId
		? lessons.find((lesson) => lesson.id === lessonId)
		: lessons[0];

	if (!selectedLesson) {
		return (
			<div className="flex h-full items-center justify-center">
				<p className="text-muted-foreground">
					Select a lesson to start learning
				</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-6">
			<div className="aspect-video overflow-hidden rounded-lg bg-black">
				<VideoPlayer videoUrl={selectedLesson.videoUrl} />
			</div>
			<div className="flex flex-col gap-2">
				<h1 className="text-2xl font-semibold">{selectedLesson.name}</h1>
				{selectedLesson.description && (
					<p className="text-muted-foreground">{selectedLesson.description}</p>
				)}
			</div>
		</div>
	);
}
