import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { db } from "@/drizzle/db";
import { revokeUserCourseAccess } from "@/features/courses/db/userCourseAcccess";
import { getCurrentUser } from "@/services/clerk";
import { updatePurchase } from "../db/purchases";
import { canRefundPurchases } from "../permissions/products";

export const refundPurchaseFn = createServerFn({ method: "POST" })
	.inputValidator(z.object({ id: z.string() }))
	.handler(async ({ data }) => {
		if (!canRefundPurchases(await getCurrentUser())) {
			return {
				error: true,
				message: "There was an error refunding this purchase",
			};
		}

		const result = await db.transaction(async (trx) => {
			const refundedPurchase = await updatePurchase(
				data.id,
				{ refundedAt: new Date() },
				trx,
			);

			await revokeUserCourseAccess(refundedPurchase, trx);

			return { error: false, message: "Successfully refunded purchase" };
		});

		return result;
	});

export function refundPurchase(id: string) {
	return refundPurchaseFn({ data: { id } });
}
