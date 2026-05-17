import { createFileRoute } from "@tanstack/react-router";
import { and, eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { ProductTable } from "@/drizzle/schema";
import { userOwnsProduct } from "@/features/products/db/products";
import { wherePublicProducts } from "@/features/products/permissions/products";
import { getCurrentUser } from "@/services/clerk";
import { getClientSessionSecret } from "@/services/payment";

export const Route = createFileRoute("/_consumer/products/$productId/purchase")({
	server: {
		handlers: {
			POST: async ({ params }) => {
				const { user } = await getCurrentUser({ allData: true });
				const product = await db.query.ProductTable.findFirst({
					columns: {
						name: true,
						id: true,
						imageUrl: true,
						description: true,
						priceInDollars: true,
					},
					where: and(eq(ProductTable.id, params.productId), wherePublicProducts),
				});
				if (!product) return new Response("Product not found", { status: 404 });

				if (user == null) {
					return new Response(null, {
						status: 302,
						headers: { Location: `/sign-in` },
					});
				}

				if (await userOwnsProduct({ userId: user.id, productId: product.id })) {
					return new Response(null, {
						status: 302,
						headers: { Location: "/courses" },
					});
				}

				try {
					const paymentLink = await getClientSessionSecret(product, user);
					return new Response(null, {
						status: 302,
						headers: { Location: paymentLink },
					});
				} catch (error) {
					console.error("Failed to generate payment link:", error);
					return new Response("Internal Server Error", { status: 500 });
				}
			},
		},
	},
});
