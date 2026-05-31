import { createFileRoute } from "@tanstack/react-router";
import { client } from "@/services/payment";
import { getCurrentUser } from "@/services/clerk";
import { db } from "@/drizzle/db";
import { and, eq } from "drizzle-orm/sql/expressions/conditions";
import { PurchaseTable } from "@/drizzle/schema";

export const Route = createFileRoute("/api/purchases/$paymentId/invoice")({
  server: {
    handlers: {
      GET,
    },
  },
});

async function GET({ params }: { params: { paymentId: string } }) {
  const { userId } = await getCurrentUser();

  if (userId == null) {
    return new Response("Unauthorized", { status: 401 });
  }

  const purchase = await db.query.PurchaseTable.findFirst({
    where: and(
      eq(PurchaseTable.paymentSessionId, params.paymentId),
      eq(PurchaseTable.userId, userId),
    ),
  });

  if (!purchase) {
    return new Response("Purchase not found", { status: 404 });
  }

  try {
    const payment = await client.invoices.payments.retrieve(params.paymentId);
    const content = await payment.blob();

    return new Response(content, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-${params.paymentId}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Failed to download invoice:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
