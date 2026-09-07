import { z } from "zod";
import { lessonStatusEnum } from "@/drizzle/schema";

export const lessonSchema = z.object({
	name: z.string().min(1, "Required"),
	sectionId: z.string().min(1, "Required"),
	status: z.enum(lessonStatusEnum.enumValues),
	videoUrl: z
		.string()
		.transform((v) => (v === "" ? null : v))
		.nullable(),
	description: z
		.string()
		.transform((v) => (v === "" ? null : v))
		.nullable(),
});
