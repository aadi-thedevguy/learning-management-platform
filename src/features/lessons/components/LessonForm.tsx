import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { type LessonStatus, lessonStatuses } from "@/drizzle/schema";
import { actionToast } from "@/hooks/use-toast";
import { createLesson, updateLesson } from "../actions/lessons";
import { getVideoUploadUrl } from "../actions/s3";
import { lessonSchema } from "../schemas/lessons";
import { VideoPlayer } from "./YouTubeVideoPlayer";

export function LessonForm({
	sections,
	defaultSectionId,
	onSuccess,
	lesson,
}: {
	sections: {
		id: string;
		name: string;
	}[];
	onSuccess?: () => void;
	defaultSectionId?: string;
	lesson?: {
		id: string;
		name: string;
		status: LessonStatus;
		youtubeVideoId: string | null;
		videoUrl: string | null;
		description: string | null;
		sectionId: string;
	};
}) {
	const router = useRouter();
	const [uploading, setUploading] = useState(false);
	const form = useForm<z.infer<typeof lessonSchema>>({
		resolver: zodResolver(lessonSchema),
		defaultValues: {
			name: lesson?.name ?? "",
			status: lesson?.status ?? "public",
			youtubeVideoId: lesson?.youtubeVideoId ?? "",
			videoUrl: lesson?.videoUrl ?? "",
			description: lesson?.description ?? "",
			sectionId: lesson?.sectionId ?? defaultSectionId ?? sections[0]?.id ?? "",
		},
	});

	async function onSubmit(values: z.infer<typeof lessonSchema>) {
		const action =
			lesson == null ? createLesson : updateLesson.bind(null, lesson.id);
		const data = await action(values);
		actionToast({ actionData: data });
		if (!data.error) onSuccess?.();
		router.invalidate();
	}

	async function handleVideoUpload(file: File) {
		if (!lesson) {
			actionToast({
				actionData: {
					error: true,
					message: "Save the lesson before uploading video",
				},
			});
			return;
		}
		setUploading(true);
		try {
			const result = await getVideoUploadUrl({
				data: {
					lessonId: lesson.id,
					fileName: file.name,
					contentType: file.type,
				},
			});
			if (result.error) {
				actionToast({ actionData: { error: true, message: result.message } });
				return;
			}
			const response = await fetch(result.uploadUrl, {
				method: "PUT",
				body: file,
				headers: { "Content-Type": file.type },
			});
			if (!response.ok) throw new Error("Upload failed");
			form.setValue("videoUrl", result.publicUrl);
			actionToast({
				actionData: { error: false, message: "Video uploaded successfully" },
			});
		} catch (error) {
			console.error("Failed to upload video:", error);
			actionToast({
				actionData: { error: true, message: "Failed to upload video" },
			});
		} finally {
			setUploading(false);
		}
	}

	const videoUrl = form.watch("videoUrl");
	const youtubeVideoId = form.watch("youtubeVideoId");

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="flex gap-6 flex-col @container"
			>
				<div className="grid grid-cols-1 @lg:grid-cols-2 gap-6">
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
						name="youtubeVideoId"
						render={({ field }) => (
							<FormItem>
								<FormLabel>YouTube Video Id</FormLabel>
								<FormControl>
									<Input {...field} value={field.value ?? ""} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<div className="flex flex-col gap-2">
						<FormLabel>Video Upload</FormLabel>
						<Input
							type="file"
							accept="video/*"
							onChange={(e) => {
								const file = e.target.files?.[0];
								if (file) handleVideoUpload(file);
							}}
							disabled={uploading}
						/>
						{uploading && (
							<p className="text-sm text-muted-foreground">Uploading...</p>
						)}
					</div>
					<FormField
						control={form.control}
						name="sectionId"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Section</FormLabel>
								<Select
									onValueChange={field.onChange}
									defaultValue={field.value}
								>
									<FormControl>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{sections.map((section) => (
											<SelectItem key={section.id} value={section.id}>
												{section.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="status"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Status</FormLabel>
								<Select
									onValueChange={field.onChange}
									defaultValue={field.value}
								>
									<FormControl>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{lessonStatuses.map((status) => (
											<SelectItem key={status} value={status}>
												{status}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
				<FormField
					control={form.control}
					name="description"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Description</FormLabel>
							<FormControl>
								<Textarea rows={10} {...field} value={field.value ?? ""} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<div className="self-end">
					<Button disabled={form.formState.isSubmitting} type="submit">
						{form.formState.isSubmitting
							? lesson
								? "Updating..."
								: "Creating..."
							: lesson
								? "Update"
								: "Create"}
					</Button>
				</div>
				{videoUrl || youtubeVideoId ? (
					<div className="aspect-video">
						<VideoPlayer videoUrl={videoUrl} youtubeVideoId={youtubeVideoId} />
					</div>
				) : null}
			</form>
		</Form>
	);
}
