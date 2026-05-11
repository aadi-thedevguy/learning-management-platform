import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { asc } from "drizzle-orm";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardHeader } from "@/components/ui/card";
import { db } from "@/drizzle/db";
import { CourseTable } from "@/drizzle/schema";
import { ProductForm } from "@/features/products/components/ProductForm";

export const getCourses = createServerFn().handler(async () => {
	return db.query.CourseTable.findMany({
		columns: { id: true, name: true },
		orderBy: asc(CourseTable.name),
	});
});

export const Route = createFileRoute("/admin/products/new")({
	loader: () => getCourses(),
	component: NewProductPage,
});

function NewProductPage() {
	const courses = Route.useLoaderData();

	return (
		<>
			<PageHeader title="New Product" />
			<Card>
				<CardHeader>
					<ProductForm courses={courses} />
				</CardHeader>
			</Card>
		</>
	);
}
