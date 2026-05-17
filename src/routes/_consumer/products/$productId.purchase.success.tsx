import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { Image } from "@unpic/react";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { db } from "@/drizzle/db";
import { ProductTable } from "@/drizzle/schema";
import { wherePublicProducts } from "@/features/products/permissions/products";

export const getPurchasedProduct = createServerFn()
	.inputValidator(z.object({ productId: z.string() }))
	.handler(async ({ data }) => {
		const product = await db.query.ProductTable.findFirst({
			columns: { name: true, imageUrl: true },
			where: and(eq(ProductTable.id, data.productId), wherePublicProducts),
		});

		if (!product) throw notFound();
		return product;
	});

export const Route = createFileRoute(
	"/_consumer/products/$productId/purchase/success",
)({
	loader: ({ params }) => getPurchasedProduct({ data: params }),
	component: ProductPurchaseSuccessPage,
});

function ProductPurchaseSuccessPage() {
	const product = Route.useLoaderData();

	return (
		<div className="flex gap-16 items-center justify-between">
			<div className="flex flex-col gap-4 items-start">
				<div className="text-3xl font-semibold">Purchase Successful</div>
				<div className="text-xl">Thank you for purchasing {product.name}.</div>
				<Button asChild className="text-xl h-auto py-4 px-8 rounded-lg">
					<Link to="/courses">View My Courses</Link>
				</Button>
			</div>
			<div className="relative aspect-video max-w-lg flex-grow">
				<Image
					src={product.imageUrl}
					alt={product.name}
					layout="fullWidth"
					className="object-contain rounded-xl"
				/>
			</div>
		</div>
	);
}
