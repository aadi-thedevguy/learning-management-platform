import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { PurchaseTable } from "@/drizzle/schema";
import { revokeUserCourseAccess } from "@/features/courses/db/userCourseAcccess";
import { getCurrentUser } from "@/services/clerk";
import { client as dodoClient } from "@/services/payment";
import { updatePurchase } from "../db/purchases";
import { canRefundPurchases } from "../permissions/products";

const refundPurchaseFn = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    if (!canRefundPurchases(await getCurrentUser())) {
      return {
        error: true,
        message: "There was an error refunding this purchase",
      };
    }

    try {
      const result = await db.transaction(async (trx) => {
        const purchase = await trx.query.PurchaseTable.findFirst({
          where: eq(PurchaseTable.id, data.id),
        });

        if (!purchase || !purchase.paymentSessionId) {
          throw new Error("Purchase record or payment session ID not found");
        }

        await dodoClient.refunds.create({
          payment_id: purchase.paymentSessionId,
        });

        const refundedPurchase = await updatePurchase(
          data.id,
          { refundedAt: new Date() },
          trx,
        );

        await revokeUserCourseAccess(refundedPurchase, trx);

        return { error: false, message: "Successfully refunded purchase" };
      });

      return result;
    } catch (error) {
      if (error instanceof Error) {
        return {
          error: true,
          message:
            error.message || "There was an error refunding this purchase",
        };
      } else {
        console.error("Unknown error refunding purchase:", error);
        return {
          error: true,
          message: "There was an error refunding this purchase",
        };
      }
    }
  });

export function refundPurchase(id: string) {
  return refundPurchaseFn({ data: { id } });
}
