import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_consumer/purchase/after")({
  validateSearch: z.object({
    payment_id: z.string().optional(),
    status: z.string().optional(),
    email: z.string().optional(),
  }),
  component: ProductPurchaseSuccessPage,
});

function ProductPurchaseSuccessPage() {
  const { payment_id, status, email } = Route.useSearch();
  const isSuccess = status === "succeeded";
  const isFailed = status === "failed";

  return (
    <section className="flex flex-col gap-4 items-start mx-auto max-w-5xl py-16">
      <h2
        className={cn("text-3xl font-semibold", {
          "text-destructive": isFailed,
          "text-emerald-500": isSuccess,
        })}
      >
        {isSuccess
          ? "Purchase Successful"
          : isFailed
            ? "Purchase Failed"
            : "Payment Pending"}
      </h2>
      <h4 className="text-xl text-muted-foreground">
        {isSuccess
          ? "Thank you for purchasing from us."
          : isFailed
            ? "There was an issue processing your payment."
            : "We are currently verifying your payment."}
      </h4>
      <div className="w-full border rounded-lg overflow-hidden min-w-87.5">
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="font-bold">Status</TableCell>
              <TableCell className="text-right capitalize">
                <Badge
                  variant={isFailed ? "destructive" : "secondary"}
                  className={cn(
                    isSuccess &&
                      "bg-emerald-500 text-white hover:bg-emerald-600",
                  )}
                >
                  {status ?? "N/A"}
                </Badge>
              </TableCell>
            </TableRow>
            {email && (
              <TableRow>
                <TableCell className="font-bold">Email</TableCell>
                {email && <TableCell className="text-right">{email}</TableCell>}
              </TableRow>
            )}
            <TableRow>
              <TableCell className="font-bold">Payment ID</TableCell>
              <TableCell className="text-right font-mono text-xs text-muted-foreground">
                {payment_id ?? "N/A"}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <Button
        asChild
        variant={isFailed ? "destructive" : "default"}
        className={cn("", {
          "bg-emerald-600 hover:bg-emerald-700 text-white border-none":
            isSuccess,
        })}
      >
        <Link to={isSuccess ? "/courses" : "/"}>
          {isSuccess ? "Access Your Content" : "Try Again"}
        </Link>
      </Button>
    </section>
  );
}
