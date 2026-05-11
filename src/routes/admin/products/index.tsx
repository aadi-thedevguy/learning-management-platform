import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { asc, countDistinct, eq } from "drizzle-orm";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { db } from "@/drizzle/db";
import {
	CourseProductTable,
	ProductTable as DbProductTable,
	PurchaseTable,
} from "@/drizzle/schema";
import { ProductTable } from "@/features/products/components/ProductTable";

export const getProducts = createServerFn().handler(async () => {
	return db
		.select({
			id: DbProductTable.id,
			name: DbProductTable.name,
			status: DbProductTable.status,
			priceInDollars: DbProductTable.priceInDollars,
			description: DbProductTable.description,
			imageUrl: DbProductTable.imageUrl,
			coursesCount: countDistinct(CourseProductTable.courseId),
			customersCount: countDistinct(PurchaseTable.userId),
		})
		.from(DbProductTable)
		.leftJoin(PurchaseTable, eq(PurchaseTable.productId, DbProductTable.id))
		.leftJoin(
			CourseProductTable,
			eq(CourseProductTable.productId, DbProductTable.id),
		)
		.orderBy(asc(DbProductTable.name))
		.groupBy(DbProductTable.id);
});

export const Route = createFileRoute("/admin/products/")({
	loader: () => getProducts(),
	component: ProductsPage,
});

function ProductsPage() {
	const products = Route.useLoaderData();

	return (
		<>
			<PageHeader title="Products">
				<Button asChild>
					<Link to="/admin/products/new">New Product</Link>
				</Button>
			</PageHeader>

			<ProductTable products={products} />
		</>
	);
}
