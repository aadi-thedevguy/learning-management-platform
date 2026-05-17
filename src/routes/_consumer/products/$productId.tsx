import { NotFoundComponent } from "@/components/NotFoundComponent";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { Image } from "@unpic/react";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { db } from "@/drizzle/db";
import { ProductTable } from "@/drizzle/schema";
import { wherePublicProducts } from "@/features/products/permissions/products";
import { formatPrice } from "@/lib/formatters";

export const getProduct = createServerFn()
	.inputValidator(z.object({ productId: z.string() }))
	.handler(async ({ data }) => {
		const product = await db.query.ProductTable.findFirst({
			columns: {
				id: true,
				name: true,
				description: true,
				priceInDollars: true,
				imageUrl: true,
			},
			where: and(eq(ProductTable.id, data.productId), wherePublicProducts),
		});

		if (!product) throw notFound();
		return product;
	});

export const Route = createFileRoute("/_consumer/products/$productId")({
	loader: ({ params }) => getProduct({ data: params }),
	component: ProductPage,
	notFoundComponent: () => <NotFoundComponent />,
});

function ProductPage() {
	const product = Route.useLoaderData();

	return (
		<div className="flex gap-16 items-center justify-between">
			<div className="flex gap-6 flex-col items-start">
				<div className="flex flex-col gap-2">
					<div className="text-xl">{formatPrice(product.priceInDollars)}</div>
					<h1 className="text-4xl font-semibold">{product.name}</h1>
				</div>
				<div className="text-xl">{product.description}</div>
				<form action={`/products/${product.id}/purchase`} method="POST">
					<Button type="submit" className="text-xl h-auto py-4 px-8 rounded-lg">
						Get Now
					</Button>
				</form>
			</div>
			<div className="relative aspect-video max-w-lg grow">
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
