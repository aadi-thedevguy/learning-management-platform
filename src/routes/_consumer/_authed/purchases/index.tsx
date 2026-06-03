import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { desc, eq } from "drizzle-orm";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { db } from "@/drizzle/db";
import { PurchaseTable } from "@/drizzle/schema";
import { UserPurchaseTable } from "@/features/purchases/components/UserPurchaseTable";
import { getCurrentUser } from "@/services/clerk";

export const getPurchases = createServerFn().handler(async () => {
  const { userId } = await getCurrentUser();
  if (!userId) throw redirect({ to: "/sign-in/$" });

  return db.query.PurchaseTable.findMany({
    columns: {
      id: true,
      pricePaidInCents: true,
      refundedAt: true,
      productDetails: true,
      createdAt: true,
    },
    where: eq(PurchaseTable.userId, userId),
    orderBy: desc(PurchaseTable.createdAt),
  });
});

export const Route = createFileRoute("/_consumer/_authed/purchases/")({
  loader: () => getPurchases(),
  component: PurchasesPage,
});

function PurchasesPage() {
  const purchases = Route.useLoaderData();

  return (
    <>
      <PageHeader title="Purchase History" />
      {purchases.length === 0 ? (
        <div className="flex flex-col gap-2 items-start">
          You have made no purchases yet
          <Button asChild size="lg">
            <Link to="/">Browse Courses</Link>
          </Button>
        </div>
      ) : (
        <UserPurchaseTable purchases={purchases} />
      )}
    </>
  );
}
