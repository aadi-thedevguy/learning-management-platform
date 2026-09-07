import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
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
import { getCourseAssetUploadUrl } from "../actions/s3";
import { courseSchema } from "../schemas/courses";
import { useRouter } from "@tanstack/react-router";

export function CourseForm({
	course,
}: {
	course?: {
		id: string;
		name: string;
		description: string;
		assetUrl: string | null;
	};
}) {
	const router = useRouter();
	const [uploading, setUploading] = useState(false);
	const form = useForm<z.infer<typeof courseSchema>>({
		resolver: zodResolver(courseSchema),
		defaultValues: course ?? {
			name: "",
			description: "",
			assetUrl: "",
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

	async function handleAssetUpload(file: File) {
		if (!file.name.toLowerCase().endsWith(".zip")) {
			actionToast({
				actionData: {
					error: true,
					message: "Course assets must be uploaded as .zip files",
				},
			});
			return;
		}

		if (!course) {
			actionToast({
				actionData: {
					error: true,
					message: "Save the course before uploading assets",
				},
			});
			return;
		}

		setUploading(true);
		try {
			const result = await getCourseAssetUploadUrl({
				data: {
					courseId: course.id,
					fileName: file.name,
					contentType: file.type || "application/octet-stream",
				},
			});
			if (result.error) {
				actionToast({ actionData: { error: true, message: result.message } });
				return;
			}

			const response = await fetch(result.uploadUrl, {
				method: "PUT",
				body: file,
				headers: { "Content-Type": file.type || "application/octet-stream" },
			});
			if (!response.ok) throw new Error("Upload failed");

			form.setValue("assetUrl", result.publicUrl, { shouldDirty: true });
			actionToast({
				actionData: { error: false, message: "Asset uploaded successfully" },
			});
		} catch (error) {
			console.error("Failed to upload course asset:", error);
			actionToast({
				actionData: { error: true, message: "Failed to upload asset" },
			});
		} finally {
			setUploading(false);
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
					name="assetUrl"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Course Asset</FormLabel>
							<FormControl>
								<Input {...field} value={field.value ?? ""} readOnly />
							</FormControl>
							<p className="text-sm text-muted-foreground">
								Upload a single .zip file containing all course assets. Only
								.zip files are accepted.
							</p>
							<Input
								type="file"
								accept=".zip,application/zip,application/x-zip-compressed"
								onChange={(e) => {
									const file = e.target.files?.[0];
									if (file) handleAssetUpload(file);
								}}
								disabled={uploading}
							/>
							{uploading && (
								<p className="text-sm text-muted-foreground">Uploading...</p>
							)}
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
