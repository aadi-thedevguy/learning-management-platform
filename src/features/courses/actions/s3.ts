import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getCurrentUser } from "@/services/auth";
import { getAssetUploadPresignedUrl } from "@/services/s3";
import { canUpdateCourses } from "../permissions/courses";

export const getCourseAssetUploadUrl = createServerFn({ method: "POST" })
	.inputValidator(
		z.object({
			courseId: z.string(),
			fileName: z.string(),
			contentType: z.string().default("application/octet-stream"),
		}),
	)
	.handler(async ({ data }) => {
		const user = await getCurrentUser();
		if (!canUpdateCourses(user)) {
			return { error: true, message: "Not authorized" };
		}

		try {
			const { uploadUrl, publicUrl, key } = await getAssetUploadPresignedUrl(
				`courses/${data.courseId}`,
				data.fileName,
				data.contentType,
			);
			return { error: false, uploadUrl, publicUrl, key };
		} catch (error) {
			console.error("Failed to generate course asset upload URL:", error);
			return {
				error: true,
				message:
					error instanceof Error
						? error.message
						: "Failed to generate upload URL",
			};
		}
	});
