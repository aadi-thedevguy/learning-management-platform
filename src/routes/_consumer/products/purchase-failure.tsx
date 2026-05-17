import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_consumer/products/purchase-failure")({
	component: () => (
		<div className="flex flex-col items-start gap-4">
			<h1 className="text-3xl font-semibold">Purchase failed</h1>
			<p className="text-muted-foreground">
				We could not complete your purchase.
			</p>
			<Button asChild>
				<Link to="/">Browse Courses</Link>
			</Button>
		</div>
	),
});
