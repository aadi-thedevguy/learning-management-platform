import { z } from "zod";
import { productStatuses } from "@/drizzle/schema";

export const productSchema = z.object({
  name: z.string().min(1, "Required"),
  priceInDollars: z.number().int().nonnegative(),
  description: z.string().min(1, "Required"),
  imageUrl: z.union([
    z.httpUrl("Invalid url"),
    z.url("Invalid url"),
    z.string().min(1, "Required"),
  ]),
  status: z.enum(productStatuses),
  courseIds: z.array(z.string()).min(1, "At least one course is required"),
});
