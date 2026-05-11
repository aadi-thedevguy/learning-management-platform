import { Link } from "@tanstack/react-router";
import { Trash2Icon } from "lucide-react";
import { ActionButton } from "@/components/ActionButton";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { formatPlural } from "@/lib/formatters";
import { deleteCourse } from "../actions/courses";

export function CourseTable({
	courses,
}: {
	courses: {
		id: string;
		name: string;
		sectionsCount: number;
		lessonsCount: number;
		studentsCount: number;
	}[];
}) {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>
						{formatPlural(courses.length, {
							singular: "course",
							plural: "courses",
						})}
					</TableHead>
					<TableHead>Students</TableHead>
					<TableHead>Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{courses.map((course) => (
					<TableRow key={course.id}>
						<TableCell>
							<div className="flex flex-col gap-1">
								<div className="font-semibold">{course.name}</div>
								<div className="text-muted-foreground">
									{formatPlural(course.sectionsCount, {
										singular: "section",
										plural: "sections",
									})}{" "}
									•{" "}
									{formatPlural(course.lessonsCount, {
										singular: "lesson",
										plural: "lessons",
									})}
								</div>
							</div>
						</TableCell>
						<TableCell>{course.studentsCount}</TableCell>
						<TableCell>
							<div className="flex gap-2">
								<Button asChild>
									<Link
										to="/admin/courses/$courseId/edit"
										params={{
											courseId: course.id,
										}}
									>
										Edit
									</Link>
								</Button>
								<ActionButton
									variant="destructiveOutline"
									requireAreYouSure
									action={deleteCourse.bind(null, course.id)}
								>
									<Trash2Icon />
									<span className="sr-only">Delete</span>
								</ActionButton>
							</div>
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
