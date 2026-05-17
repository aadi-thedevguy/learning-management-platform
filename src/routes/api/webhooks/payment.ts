import { createFileRoute } from "@tanstack/react-router";
import type { Payment as BasePayment } from "dodopayments/resources/payments.mjs";
import { eq } from "drizzle-orm";
import { Webhook } from "standardwebhooks";
import { db } from "@/drizzle/db";
import { ProductTable } from "@/drizzle/schema";
import { env } from "@/env";
import { addUserCourseAccess } from "@/features/courses/db/userCourseAcccess";
import { insertPurchase } from "@/features/purchases/db/purchases";
import { getUser } from "@/services/clerk";

export const Route = createFileRoute("/api/webhooks/payment")({
	server: {
		handlers: {
			POST,
			GET: async () => {
				return new Response("Hello", { status: 200 });
			},
		},
	},
});

type Payment = BasePayment & { payload_type: string };
type WebhookPayload = {
	type: string;
	data: Payment;
};

async function POST({ request }: { request: Request }) {
	console.log("🎯 Webhook Request Received:", new Date().toISOString());

	if (request.method !== "POST") {
		console.log("❌ Invalid Method:", request.method);
		return new Response("Method not allowed", { status: 405 });
	}

	const webhookHeaders = {
		"webhook-id": request.headers.get("webhook-id") || "",
		"webhook-signature": request.headers.get("webhook-signature") || "",
		"webhook-timestamp": request.headers.get("webhook-timestamp") || "",
	};

	console.log("🔐 Webhook Headers:", {
		hasId: !!webhookHeaders["webhook-id"],
		hasTimestamp: !!webhookHeaders["webhook-timestamp"],
		hasSignature: !!webhookHeaders["webhook-signature"],
	});

	if (
		!webhookHeaders["webhook-id"] ||
		!webhookHeaders["webhook-timestamp"] ||
		!webhookHeaders["webhook-signature"]
	) {
		console.error("❌ Missing Webhook Headers");
		return new Response("Error occurred -- missing headers", { status: 400 });
	}

	const rawBody = await request.text();
	const wh = new Webhook(env.DODOPAYMENTS_WEBHOOK_SECRET);
	let event: WebhookPayload;

	try {
		await wh.verify(rawBody, webhookHeaders);
		console.log("✅ Webhook Verified Successfully");

		event = JSON.parse(rawBody) as WebhookPayload;
		console.log("📥 Received Webhook Type:", event.type);
	} catch (err) {
		console.error("🚨 Webhook Verification Failed:", err);
		return new Response("Error occurred", { status: 400 });
	}

	switch (event.type) {
		case "payment.succeeded": {
			if (event.data.payload_type !== "Payment") break;
			if (event.data.subscription_id) break;

			const userId = event.data.metadata?.userId;
			const productId = event.data.metadata?.productId;

			if (!userId || !productId) {
				console.error("❌ Missing metadata in payload");
				return new Response("Missing metadata", { status: 400 });
			}

			const [product, user] = await Promise.all([
				getProduct(productId as string),
				getUser(userId as string),
			]);

			console.log("✅ Context Retrieved:", {
				user: user?.id,
				product: product?.id,
			});

			if (product == null) return new Response("Product not found", { status: 404 });
			if (user == null) return new Response("User not found", { status: 404 });

			const courseIds = product.courseProducts.map((cp) => cp.courseId);

			try {
				await db.transaction(async (trx) => {
					await addUserCourseAccess({ userId: user.id, courseIds }, trx);
					await insertPurchase(
						{
							paymentSessionId: event.data.payment_id,
							pricePaidInCents: event.data.total_amount,
							productDetails: product,
							userId: user.id,
							productId,
						},
						trx,
					);
				});

				console.log("✨ New Purchase Created Successfully");
			} catch (error) {
				console.error("🚨 Transaction Failed:", error);
				return new Response("Internal Server Error", { status: 500 });
			}
			return new Response(productId, { status: 200 });
		}
		default: {
			console.log("ℹ️ Unhandled Webhook Event:", event.type);
		}
	}

	console.log("🎉 Webhook Processed Successfully");
	return new Response("Success", { status: 200 });
}

function getProduct(id: string) {
	return db.query.ProductTable.findFirst({
		columns: {
			id: true,
			priceInDollars: true,
			name: true,
			description: true,
			imageUrl: true,
		},
		where: eq(ProductTable.id, id),
		with: {
			courseProducts: { columns: { courseId: true } },
		},
	});
}