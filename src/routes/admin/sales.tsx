import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { desc } from "drizzle-orm";
import { PageHeader } from "@/components/PageHeader";
import { db } from "@/drizzle/db";
import { PurchaseTable as DbPurchaseTable } from "@/drizzle/schema";
import { PurchaseTable } from "@/features/purchases/components/PurchaseTable";

export const getPurchases = createServerFn().handler(async () => {
	return db.query.PurchaseTable.findMany({
		columns: {
			id: true,
			pricePaidInCents: true,
			refundedAt: true,
			productDetails: true,
			createdAt: true,
		},
		orderBy: desc(DbPurchaseTable.createdAt),
		with: { user: { columns: { name: true } } },
	});
});

export const Route = createFileRoute("/admin/sales")({
	loader: () => getPurchases(),
	component: PurchasesPage,
});

function PurchasesPage() {
	const purchases = Route.useLoaderData();

	return (
		<>
			<PageHeader title="Sales" />
			<PurchaseTable purchases={purchases} />
		</>
	);
}
