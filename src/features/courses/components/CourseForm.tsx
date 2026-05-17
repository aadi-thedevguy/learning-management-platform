import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import { RequiredLabelIcon } from "@/components/RequiredLabelIcon";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { actionToast } from "@/hooks/use-toast";
import { createCourse, updateCourse } from "../actions/courses";
import { courseSchema } from "../schemas/courses";
import { useRouter } from "@tanstack/react-router";

export function CourseForm({
	course,
}: {
	course?: {
		id: string;
		name: string;
		description: string;
	};
}) {
	const router = useRouter();
	const form = useForm<z.infer<typeof courseSchema>>({
		resolver: zodResolver(courseSchema),
		defaultValues: course ?? {
			name: "",
			description: "",
		},
	});

	async function onSubmit(values: z.infer<typeof courseSchema>) {
		if (course) {
			const action = updateCourse.bind(null, course.id);
			const data = await action(values);
			actionToast({ actionData: data });
			router.invalidate();
		} else {
			const action = createCourse;
			const data = await action(values);
			actionToast({ actionData: data });
			router.navigate({
				href: `/admin/courses/${data.data?.courseId}/edit`,
			});
		}
	}

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="flex gap-6 flex-col"
			>
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								<RequiredLabelIcon />
								Name
							</FormLabel>
							<FormControl>
								<Input {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="description"
					render={({ field }) => (
						<FormItem>
							<FormLabel>
								<RequiredLabelIcon />
								Description
							</FormLabel>
							<FormControl>
								<Textarea className="min-h-20 resize-none" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<div className="self-end">
					<Button disabled={form.formState.isSubmitting} type="submit">
						{form.formState.isSubmitting
							? course
								? "Updating..."
								: "Creating..."
							: course
								? "Update"
								: "Create"}
					</Button>
				</div>
			</form>
		</Form>
	);
}
