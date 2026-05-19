import { NotFoundComponent } from "@/components/NotFoundComponent";
import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { and, eq } from "drizzle-orm";
import { Fragment } from "react";
import { z } from "zod";
import { PageHeader } from "@/components/PageHeader";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { db } from "@/drizzle/db";
import { PurchaseTable } from "@/drizzle/schema";
import { formatDate, formatPrice } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { getCurrentUser } from "@/services/clerk";

export const getPurchase = createServerFn()
	.inputValidator(z.object({ purchaseId: z.string() }))
	.handler(async ({ data }) => {
		const { userId, user } = await getCurrentUser({ allData: true });
		if (userId == null || user == null) throw redirect({ to: "/sign-in" });

		const purchase = await db.query.PurchaseTable.findFirst({
			columns: {
				pricePaidInCents: true,
				refundedAt: true,
				productDetails: true,
				createdAt: true,
			},
			where: and(
				eq(PurchaseTable.id, data.purchaseId),
				eq(PurchaseTable.userId, userId),
			),
		});

		if (!purchase) throw notFound();

		return {
			purchase,
			customerName: user.name,
			pricingRows: [
				{
					label: "Total",
					amountInDollars: purchase.pricePaidInCents / 100,
					isBold: true,
				},
			],
		};
	});

export const Route = createFileRoute("/_consumer/_authed/purchases/$purchaseId")({
	loader: ({ params }) => getPurchase({ data: params }),
	component: PurchasePage,
	notFoundComponent: () => <NotFoundComponent />,
});

function PurchasePage() {
	const { purchase, customerName, pricingRows } = Route.useLoaderData();
	const { purchaseId } = Route.useParams();

	return (
		<>
			<PageHeader title={purchase.productDetails.name} />

			<Card>
				<CardHeader className="pb-4">
					<div className="flex justify-between items-start gap-4">
						<div className="flex flex-col gap-1">
							<CardTitle>Receipt</CardTitle>
							<CardDescription>ID: {purchaseId}</CardDescription>
						</div>
						<Badge className="text-base">
							{purchase.refundedAt ? "Refunded" : "Paid"}
						</Badge>
					</div>
				</CardHeader>
				<CardContent className="pb-4 grid grid-cols-2 gap-8 border-t pt-4">
					<div>
						<div className="text-sm text-muted-foreground font-medium">
							Date
						</div>
						<div>{formatDate(purchase.createdAt)}</div>
					</div>
					<div>
						<div className="text-sm text-muted-foreground font-medium">
							Product
						</div>
						<div>{purchase.productDetails.name}</div>
					</div>
					<div>
						<div className="text-sm text-muted-foreground font-medium">
							Customer
						</div>
						<div>{customerName}</div>
					</div>
					<div>
						<div className="text-sm text-muted-foreground font-medium">
							Seller
						</div>
						<div>Web Dev Simplified</div>
					</div>
				</CardContent>
				<CardFooter className="grid grid-cols-2 gap-y-4 gap-x-8 border-t pt-4">
					{pricingRows.map(({ label, amountInDollars, isBold }) => (
						<Fragment key={label}>
							<div className={cn(isBold && "font-bold")}>{label}</div>
							<div className={cn("justify-self-end", isBold && "font-bold")}>
								{formatPrice(amountInDollars, { showZeroAsNumber: true })}
							</div>
						</Fragment>
					))}
				</CardFooter>
			</Card>
		</>
	);
}
