import { NotFoundComponent } from "@/components/NotFoundComponent";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardHeader } from "@/components/ui/card";
import { db } from "@/drizzle/db";
import {
	CourseProductTable,
	CourseTable,
	ProductTable,
} from "@/drizzle/schema";
import { ProductForm } from "@/features/products/components/ProductForm";

export const getProductEditorData = createServerFn()
	.inputValidator(z.object({ productId: z.string() }))
	.handler(async ({ data }) => {
		const [courses, product] = await Promise.all([
			db.query.CourseTable.findMany({
				columns: { id: true, name: true },
				orderBy: asc(CourseTable.name),
			}),
			db.query.ProductTable.findFirst({
				where: eq(ProductTable.id, data.productId),
				columns: {
					id: true,
					name: true,
					description: true,
					priceInDollars: true,
					imageUrl: true,
					status: true,
				},
				with: {
					courseProducts: {
						columns: { courseId: true },
						where: eq(CourseProductTable.productId, data.productId),
					},
				},
			}),
		]);

		if (!product) throw notFound();

		return {
			courses,
			product: {
				...product,
				courseIds: product.courseProducts.map((cp) => cp.courseId),
			},
		};
	});

export const Route = createFileRoute("/admin/products/$productId/edit")({
	loader: ({ params }) => getProductEditorData({ data: params }),
	component: EditProductPage,
	notFoundComponent: () => <NotFoundComponent />,
});

function EditProductPage() {
	const { courses, product } = Route.useLoaderData();

	return (
		<>
			<PageHeader title={`Edit ${product.name}`} />
			<Card>
				<CardHeader>
					<ProductForm product={product} courses={courses} />
				</CardHeader>
			</Card>
		</>
	);
}
