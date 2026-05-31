// import { createFileRoute, Link, notFound } from "@tanstack/react-router";
// import { createServerFn } from "@tanstack/react-start";
// import { and, asc, desc, eq, gt, lt } from "drizzle-orm";
// import { z } from "zod";
// import { db } from "@/drizzle/db";
// import {
//   CourseSectionTable,
//   LessonTable,
//   UserLessonCompleteTable,
// } from "@/drizzle/schema";
// import { wherePublicCourseSections } from "@/features/courseSections/permissions/sections";
// import { wherePublicLessons } from "@/features/lessons/permissions/lessons";
// import { getCurrentUser } from "@/services/clerk";
// import { canViewLesson } from "@/features/lessons/permissions/lessons";
// import { canUpdateUserLessonCompleteStatus } from "@/features/lessons/permissions/userLessonComplete";
// import { ActionButton } from "@/components/ActionButton";
// import { SkeletonButton } from "@/components/Skeleton";
// import { Button } from "@/components/ui/button";
// import { CheckSquare2Icon, LockIcon, XSquareIcon } from "lucide-react";
// import { YouTubeVideoPlayer } from "@/features/lessons/components/YouTubeVideoPlayer";
// import { updateLessonCompleteStatus } from "@/features/lessons/actions/userLessonComplete";
// import { Suspense } from "react";
// import type { ReactNode } from "react";
// import { NotFoundComponent } from "@/components/NotFoundComponent";

// export const getLesson = createServerFn()
//   .inputValidator(z.object({ lessonId: z.string() }))
//   .handler(async ({ data }) => {
//     return db.query.LessonTable.findFirst({
//       columns: {
//         id: true,
//         youtubeVideoId: true,
//         name: true,
//         description: true,
//         status: true,
//         sectionId: true,
//         order: true,
//       },
//       where: and(eq(LessonTable.id, data.lessonId), wherePublicLessons),
//     });
//   });

// export const getIsLessonComplete = createServerFn()
//   .inputValidator(z.object({ userId: z.string(), lessonId: z.string() }))
//   .handler(async ({ data }) => {
//     const completedLesson = await db.query.UserLessonCompleteTable.findFirst({
//       where: and(
//         eq(UserLessonCompleteTable.userId, data.userId),
//         eq(UserLessonCompleteTable.lessonId, data.lessonId),
//       ),
//     });
//     return completedLesson != null;
//   });

// export const getPreviousLesson = createServerFn()
//   .inputValidator(
//     z.object({ id: z.string(), sectionId: z.string(), order: z.number() }),
//   )
//   .handler(async ({ data: lesson }) => {
//     let previousLesson = await db.query.LessonTable.findFirst({
//       where: and(
//         lt(LessonTable.order, lesson.order),
//         eq(LessonTable.sectionId, lesson.sectionId),
//         wherePublicLessons,
//       ),
//       orderBy: desc(LessonTable.order),
//       columns: { id: true },
//     });

//     if (previousLesson == null) {
//       const section = await db.query.CourseSectionTable.findFirst({
//         where: eq(CourseSectionTable.id, lesson.sectionId),
//         columns: { order: true, courseId: true },
//       });

//       if (section == null) return;

//       const previousSection = await db.query.CourseSectionTable.findFirst({
//         where: and(
//           lt(CourseSectionTable.order, section.order),
//           eq(CourseSectionTable.courseId, section.courseId),
//           wherePublicCourseSections,
//         ),
//         orderBy: desc(CourseSectionTable.order),
//         columns: { id: true },
//       });

//       if (previousSection == null) return;

//       previousLesson = await db.query.LessonTable.findFirst({
//         where: and(
//           eq(LessonTable.sectionId, previousSection.id),
//           wherePublicLessons,
//         ),
//         orderBy: desc(LessonTable.order),
//         columns: { id: true },
//       });
//     }
//     return previousLesson;
//   });

// export const getNextLesson = createServerFn()
//   .inputValidator(
//     z.object({ id: z.string(), sectionId: z.string(), order: z.number() }),
//   )
//   .handler(async ({ data: lesson }) => {
//     let nextLesson = await db.query.LessonTable.findFirst({
//       where: and(
//         gt(LessonTable.order, lesson.order),
//         eq(LessonTable.sectionId, lesson.sectionId),
//         wherePublicLessons,
//       ),
//       orderBy: asc(LessonTable.order),
//       columns: { id: true },
//     });

//     if (nextLesson == null) {
//       const section = await db.query.CourseSectionTable.findFirst({
//         where: eq(CourseSectionTable.id, lesson.sectionId),
//         columns: { order: true, courseId: true },
//       });

//       if (section == null) return;

//       const nextSection = await db.query.CourseSectionTable.findFirst({
//         where: and(
//           gt(CourseSectionTable.order, section.order),
//           eq(CourseSectionTable.courseId, section.courseId),
//           wherePublicCourseSections,
//         ),
//         orderBy: asc(CourseSectionTable.order),
//         columns: { id: true },
//       });

//       if (nextSection == null) return;

//       nextLesson = await db.query.LessonTable.findFirst({
//         where: and(
//           eq(LessonTable.sectionId, nextSection.id),
//           wherePublicLessons,
//         ),
//         orderBy: asc(LessonTable.order),
//         columns: { id: true },
//       });
//     }
//     return nextLesson;
//   });

// export const Route = createFileRoute(
//   "/_consumer/_authed/courses/$courseId/lessons/$lessonId",
// )({
//   loader: async ({ params }) => {
//     const { courseId, lessonId } = params;
//     const lesson = await getLesson({ data: { lessonId } });

//     if (!lesson) throw notFound();

//     const { userId, role } = await getCurrentUser();
//     const isLessonComplete =
//       userId == null ? false : await getIsLessonComplete({ userId, lessonId });
//     const canView = await canViewLesson({ role, userId }, lesson);
//     const canUpdateCompletionStatus = await canUpdateUserLessonCompleteStatus(
//       { userId },
//       lesson.id,
//     );

//     return {
//       lesson,
//       courseId,
//       isLessonComplete,
//       canView,
//       canUpdateCompletionStatus,
//       userId,
//       role,
//     };
//   },
//   component: LessonPage,
//   notFoundComponent: () => <NotFoundComponent />,
// });

// function LessonPage() {
//   const {
//     lesson,
//     courseId,
//     isLessonComplete,
//     canView,
//     canUpdateCompletionStatus,
//   } = Route.useLoaderData();

//   return (
//     <div className="my-4 flex flex-col gap-4">
//       <div className="aspect-video">
//         {canView ? (
//           <YouTubeVideoPlayer
//             videoId={lesson.youtubeVideoId}
//             onFinishedVideo={
//               !isLessonComplete && canUpdateCompletionStatus
//                 ? updateLessonCompleteStatus.bind(null, lesson.id, true)
//                 : undefined
//             }
//           />
//         ) : (
//           <div className="flex items-center justify-center bg-primary text-primary-foreground h-full w-full">
//             <LockIcon className="size-16" />
//           </div>
//         )}
//       </div>
//       <div className="flex flex-col gap-2">
//         <div className="flex justify-between items-start gap-4">
//           <h1 className="text-2xl font-semibold">{lesson.name}</h1>
//           <div className="flex gap-2 justify-end">
//             <Suspense fallback={<SkeletonButton />}>
//               <ToLessonButton
//                 lesson={lesson}
//                 courseId={courseId}
//                 lessonFunc={getPreviousLesson}
//               >
//                 Previous
//               </ToLessonButton>
//             </Suspense>
//             {canUpdateCompletionStatus && (
//               <ActionButton
//                 action={updateLessonCompleteStatus.bind(
//                   null,
//                   lesson.id,
//                   !isLessonComplete,
//                 )}
//                 variant="outline"
//               >
//                 <div className="flex gap-2 items-center">
//                   {isLessonComplete ? (
//                     <>
//                       <CheckSquare2Icon /> Mark Incomplete
//                     </>
//                   ) : (
//                     <>
//                       <XSquareIcon /> Mark Complete
//                     </>
//                   )}
//                 </div>
//               </ActionButton>
//             )}
//             <Suspense fallback={<SkeletonButton />}>
//               <ToLessonButton
//                 lesson={lesson}
//                 courseId={courseId}
//                 lessonFunc={getNextLesson}
//               >
//                 Next
//               </ToLessonButton>
//             </Suspense>
//           </div>
//         </div>
//         {canView ? (
//           lesson.description && <p>{lesson.description}</p>
//         ) : (
//           <p>This lesson is locked. Please purchase the course to view it.</p>
//         )}
//       </div>
//     </div>
//   );
// }

// async function ToLessonButton({
//   children,
//   courseId,
//   lessonFunc,
//   lesson,
// }: {
//   children: ReactNode;
//   courseId: string;
//   lesson: {
//     id: string;
//     sectionId: string;
//     order: number;
//   };
//   lessonFunc: (data: {
//     id: string;
//     sectionId: string;
//     order: number;
//   }) => Promise<{ id: string } | undefined>;
// }) {
//   const toLesson = await lessonFunc(lesson);
//   if (toLesson == null) return null;

//   return (
//     <Button variant="outline" asChild>
//       <Link
//         to="/courses/$courseId/lessons/$lessonId"
//         params={{ courseId, lessonId: toLesson.id }}
//       >
//         {children}
//       </Link>
//     </Button>
//   );
// }

// export const getLesson = createServerFn()
//   .inputValidator(z.object({ courseId: z.string(), lessonId: z.string() }))
//   .handler(async ({ data }) => {
//     const lesson = await db.query.LessonTable.findFirst({
//       columns: {
//         id: true,
//         youtubeVideoId: true,
//         name: true,
//         description: true,
//         status: true,
//         sectionId: true,
//         order: true,
//       },
//       where: and(eq(LessonTable.id, data.lessonId), wherePublicLessons),
//     });

//     if (!lesson) throw notFound();

//     const { userId, role } = await getCurrentUser();
//     const canView = await canViewLesson({ role, userId }, lesson);
//     const canUpdateCompletionStatus = await canUpdateUserLessonCompleteStatus(
//       { userId },
//       lesson.id,
//     );

//     return {
//       lesson,
//       courseId: data.courseId,
//       canView,
//       canUpdateCompletionStatus,
//       isLessonComplete: false,
//     };
//   });

// // export const Route = createFileRoute(
// //   "/_consumer/courses/$courseId/lessons/$lessonId",
// // )({
// //   loader: ({ params }) => getLesson({ data: params }),
// //   component: LessonPage,
// //   notFoundComponent: () => <NotFoundComponent />,
// // });

// // function LessonPage() {
// //   const { lesson, courseId, canView, canUpdateCompletionStatus } =
// //     Route.useLoaderData();

// //   return (
// //     <div className="my-4 flex flex-col gap-4">
// //       <div className="aspect-video">
// //         {canView ? (
// //           <YouTubeVideoPlayer
// //             videoId={lesson.youtubeVideoId}
// //             onFinishedVideo={
// //               canUpdateCompletionStatus
// //                 ? updateLessonCompleteStatus.bind(null, lesson.id, true)
// //                 : undefined
// //             }
// //           />
// //         ) : (
// //           <div className="flex items-center justify-center bg-primary text-primary-foreground h-full w-full">
// //             <LockIcon className="size-16" />
// //           </div>
// //         )}
// //       </div>
// //       <div className="flex flex-col gap-2">
// //         <div className="flex justify-between items-start gap-4">
// //           <h1 className="text-2xl font-semibold">{lesson.name}</h1>
// //           <div className="flex gap-2 justify-end">
// //             {canUpdateCompletionStatus && (
// //               <ActionButton
// //                 action={updateLessonCompleteStatus.bind(null, lesson.id, true)}
// //                 variant="outline"
// //               >
// //                 <div className="flex gap-2 items-center">
// //                   <CheckSquare2Icon />
// //                   <XSquareIcon className="hidden" /> Mark Complete
// //                 </div>
// //               </ActionButton>
// //             )}
// //             <Button variant="outline" asChild>
// //               <Link to="/courses/$courseId" params={{ courseId }}>
// //                 Back to Course
// //               </Link>
// //             </Button>
// //           </div>
// //         </div>
// //         {canView ? (
// //           lesson.description && <p>{lesson.description}</p>
// //         ) : (
// //           <p>This lesson is locked. Please purchase the course to view it.</p>
// //         )}
// //       </div>
// //     </div>
// //   );
// // }
