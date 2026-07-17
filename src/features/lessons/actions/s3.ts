import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getCurrentUser } from "@/services/auth";
import { getVideoUploadPresignedUrl } from "@/services/s3";

export const getVideoUploadUrl = createServerFn({ method: "POST" })
	.inputValidator(
		z.object({
			lessonId: z.string(),
			fileName: z.string(),
			contentType: z.string().default("video/mp4"),
		}),
	)
	.handler(async ({ data }) => {
		const { userId } = await getCurrentUser();
		if (!userId) {
			return { error: true, message: "Not authenticated" };
		}

		try {
			const { uploadUrl, publicUrl, key } = await getVideoUploadPresignedUrl(
				data.lessonId,
				data.fileName,
				data.contentType,
			);
			return { error: false, uploadUrl, publicUrl, key };
		} catch (error) {
			console.error("Failed to generate video upload URL:", error);
			return {
				error: true,
				message:
					error instanceof Error
						? error.message
						: "Failed to generate upload URL",
			};
		}
	});
