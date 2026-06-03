import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle2Icon, VideoIcon } from "lucide-react";
import { NotFoundComponent } from "@/components/NotFoundComponent";
import { getCourseLayoutData } from "@/features/courses/actions/courses";
import { z } from "zod";

const lessonSearchSchema = z.object({
  lessonId: z.string().optional(),
});

export const Route = createFileRoute(
  "/_consumer/_authed/courses/$courseId/_sidebar",
)({
  validateSearch: lessonSearchSchema,
  loader: ({ params }) => getCourseLayoutData({ data: params }),
  component: CourseLayout,
  notFoundComponent: () => <NotFoundComponent />,
});

function CourseLayout() {
  const { course } = Route.useLoaderData();
  const { lessonId } = Route.useSearch();

  const defaultValue = lessonId
    ? course.courseSections.find((section) =>
        section.lessons.find((lesson) => lesson.id === lessonId),
      )
    : course.courseSections[0];

  return (
    <div className="grid grid-cols-[300px_1fr] gap-8 container h-screen">
      <aside className="py-4 border-r pr-8">
        <div className="text-lg font-semibold mb-4">{course.name}</div>
        <Accordion
          type="multiple"
          defaultValue={defaultValue ? [defaultValue.id] : undefined}
        >
          {course.courseSections.map((section) => (
            <AccordionItem key={section.id} value={section.id}>
              <AccordionTrigger className="text-base py-2">
                {section.name}
              </AccordionTrigger>
              <AccordionContent className="flex flex-col gap-1">
                {section.lessons.map((lesson) => (
                  <Button
                    variant="ghost"
                    asChild
                    key={lesson.id}
                    className={cn(
                      "justify-start h-9 w-full font-normal",
                      lesson.id === lessonId &&
                        "bg-accent text-accent-foreground font-medium",
                    )}
                  >
                    <Link
                      to="/courses/$courseId"
                      params={{ courseId: course.id }}
                      search={(prev) => ({ ...prev, lessonId: lesson.id })}
                    >
                      <VideoIcon className="mr-2 size-4" />
                      <span className="truncate">{lesson.name}</span>
                      {lesson.isComplete && (
                        <CheckCircle2Icon className="ml-auto size-4 text-primary" />
                      )}
                    </Link>
                  </Button>
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </aside>
      <main className="py-4">
        <Outlet />
      </main>
    </div>
  );
}
