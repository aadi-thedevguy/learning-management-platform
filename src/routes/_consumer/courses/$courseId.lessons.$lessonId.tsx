import { NotFoundComponent } from "@/components/NotFoundComponent";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import { CheckSquare2Icon, LockIcon, XSquareIcon } from "lucide-react";
import { z } from "zod";
import { ActionButton } from "@/components/ActionButton";
import { Button } from "@/components/ui/button";
import { db } from "@/drizzle/db";
import { LessonTable } from "@/drizzle/schema";
import { updateLessonCompleteStatus } from "@/features/lessons/actions/userLessonComplete";
import { YouTubeVideoPlayer } from "@/features/lessons/components/YouTubeVideoPlayer";
import {
	canViewLesson,
	wherePublicLessons,
} from "@/features/lessons/permissions/lessons";
import { canUpdateUserLessonCompleteStatus } from "@/features/lessons/permissions/userLessonComplete";
import { getCurrentUser } from "@/services/clerk";

export const getLesson = createServerFn()
	.inputValidator(z.object({ courseId: z.string(), lessonId: z.string() }))
	.handler(async ({ data }) => {
		const lesson = await db.query.LessonTable.findFirst({
			columns: {
				id: true,
				youtubeVideoId: true,
				name: true,
				description: true,
				status: true,
				sectionId: true,
				order: true,
			},
			where: and(eq(LessonTable.id, data.lessonId), wherePublicLessons),
		});

		if (!lesson) throw notFound();

		const { userId, role } = await getCurrentUser();
		const canView = await canViewLesson({ role, userId }, lesson);
		const canUpdateCompletionStatus = await canUpdateUserLessonCompleteStatus(
			{ userId },
			lesson.id,
		);

		return {
			lesson,
			courseId: data.courseId,
			canView,
			canUpdateCompletionStatus,
			isLessonComplete: false,
		};
	});

export const Route = createFileRoute(
	"/_consumer/courses/$courseId/lessons/$lessonId",
)({
	loader: ({ params }) => getLesson({ data: params }),
	component: LessonPage,
	notFoundComponent: () => <NotFoundComponent />,
});

function LessonPage() {
	const { lesson, courseId, canView, canUpdateCompletionStatus } =
		Route.useLoaderData();

	return (
		<div className="my-4 flex flex-col gap-4">
			<div className="aspect-video">
				{canView ? (
					<YouTubeVideoPlayer
						videoId={lesson.youtubeVideoId}
						onFinishedVideo={
							canUpdateCompletionStatus
								? updateLessonCompleteStatus.bind(null, lesson.id, true)
								: undefined
						}
					/>
				) : (
					<div className="flex items-center justify-center bg-primary text-primary-foreground h-full w-full">
						<LockIcon className="size-16" />
					</div>
				)}
			</div>
			<div className="flex flex-col gap-2">
				<div className="flex justify-between items-start gap-4">
					<h1 className="text-2xl font-semibold">{lesson.name}</h1>
					<div className="flex gap-2 justify-end">
						{canUpdateCompletionStatus && (
							<ActionButton
								action={updateLessonCompleteStatus.bind(null, lesson.id, true)}
								variant="outline"
							>
								<div className="flex gap-2 items-center">
									<CheckSquare2Icon />
									<XSquareIcon className="hidden" /> Mark Complete
								</div>
							</ActionButton>
						)}
						<Button variant="outline" asChild>
							<Link to="/courses/$courseId" params={{ courseId }}>
								Back to Course
							</Link>
						</Button>
					</div>
				</div>
				{canView ? (
					lesson.description && <p>{lesson.description}</p>
				) : (
					<p>This lesson is locked. Please purchase the course to view it.</p>
				)}
			</div>
		</div>
	);
}
