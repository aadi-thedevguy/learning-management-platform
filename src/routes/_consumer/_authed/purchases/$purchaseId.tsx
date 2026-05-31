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
import { Button } from "@/components/ui/button";
import { client as dodoClient } from "@/services/payment";
import type { DodoPayments } from "dodopayments";
import type { Discount } from "dodopayments/resources/discounts.mjs";

export const getPurchase = createServerFn()
  .inputValidator(z.object({ purchaseId: z.string() }))
  .handler(async ({ data }) => {
    const { userId, user } = await getCurrentUser({ allData: true });
    if (userId == null || user == null) throw redirect({ href: "/sign-in" });

    const purchase = await db.query.PurchaseTable.findFirst({
      columns: {
        id: true,
        pricePaidInCents: true,
        refundedAt: true,
        productDetails: true,
        createdAt: true,
        paymentSessionId: true,
      },
      where: and(
        eq(PurchaseTable.id, data.purchaseId),
        eq(PurchaseTable.userId, userId),
      ),
      with: {
        product: { columns: { priceInDollars: true } },
      },
    });

    if (!purchase) throw notFound();

    const payment = (await dodoClient.payments.retrieve(
      purchase.paymentSessionId,
    )) as DodoPayments.Payment & { discounts: Discount[] };

    // The base price from our database (e.g., 15000 cents / $150.00)
    const subtotal = purchase.product.priceInDollars * 100;

    // Total discount = Original Price - (Total Paid - Tax)
    // This includes both PPP regional pricing and any applied coupons in a single value
    const totalDiscountAmount =
      subtotal - (payment.total_amount - (payment.tax ?? 0));

    const refundAmount =
      purchase.refundedAt != null ? purchase.pricePaidInCents : 0;

    const firstDiscount = payment.discounts?.[0];
    const discountLabel = firstDiscount
      ? `PPP - (${firstDiscount.name || firstDiscount.code})`
      : "PPP Discount";

    const discounts =
      totalDiscountAmount > 0
        ? [
            {
              label: discountLabel,
              amount: totalDiscountAmount,
            },
          ]
        : [];

    return {
      purchase,
      receiptUrl: `/api/purchases/${purchase.paymentSessionId}/invoice`,
      customerName: user.name,
      pricingRows: getPricingRows({
        total: payment.total_amount - refundAmount,
        subtotal,
        tax: payment?.tax ?? 0,
        discounts,
        refund: refundAmount,
      }),
    };
  });

export const Route = createFileRoute(
  "/_consumer/_authed/purchases/$purchaseId",
)({
  loader: ({ params }) => getPurchase({ data: params }),
  component: PurchasePage,
  notFoundComponent: () => <NotFoundComponent />,
});

function PurchasePage() {
  const { purchase, customerName, pricingRows, receiptUrl } =
    Route.useLoaderData();
  const { purchaseId } = Route.useParams();

  return (
    <>
      <PageHeader title={purchase.productDetails.name}>
        {receiptUrl && (
          <Button variant="outline" asChild className="ml-auto">
            <a target="_blank" href={receiptUrl}>
              Download Invoice
            </a>
          </Button>
        )}
      </PageHeader>

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

function getPricingRows({
  total,
  subtotal,
  tax,
  discounts,
  refund,
}: {
  total: number;
  subtotal: number;
  tax?: number;
  discounts: { label: string; amount: number }[];
  refund: number;
}) {
  const pricingRows: {
    label: string;
    amountInDollars: number;
    isBold?: boolean;
  }[] = [];

  discounts.forEach((d) => {
    pricingRows.push({
      label: d.label,
      amountInDollars: d.amount / -100,
    });
  });

  if (tax && tax > 0) {
    pricingRows.push({
      label: "Tax",
      amountInDollars: tax / 100,
    });
  }

  if (refund > 0) {
    pricingRows.push({
      label: "Refund",
      amountInDollars: refund / -100,
    });
  }

  if (pricingRows.length === 0) {
    return [{ label: "Total", amountInDollars: total / 100, isBold: true }];
  }

  return [
    { label: "Subtotal", amountInDollars: subtotal / 100 },
    ...pricingRows,
    { label: "Total", amountInDollars: total / 100, isBold: true },
  ];
}
