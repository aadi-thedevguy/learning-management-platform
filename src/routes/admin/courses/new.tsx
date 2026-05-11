import { PageHeader } from "@/components/PageHeader";
import { Card, CardHeader } from "@/components/ui/card";
import { CourseForm } from "@/features/courses/components/CourseForm";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/courses/new")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<>
			<PageHeader title="New Course" />
			<Card>
				<CardHeader>
					<CourseForm />
				</CardHeader>
			</Card>
		</>
	);
}
