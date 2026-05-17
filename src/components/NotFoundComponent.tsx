import { Link } from "@tanstack/react-router";
import { AlertCircle } from "lucide-react";
import { Button } from "./ui/button";

export function NotFoundComponent() {
	return (
		<div className="flex flex-col items-center justify-center min-h-[50vh] gap-6 text-center px-4">
			<div className="bg-muted rounded-full p-6">
				<AlertCircle className="size-12 text-muted-foreground" />
			</div>
			<div className="space-y-2">
				<h1 className="text-3xl font-bold tracking-tight">Page Not Found</h1>
				<p className="text-muted-foreground max-w-[500px]">
					The page you are looking for doesn't exist or has been moved.
				</p>
			</div>
			<Button asChild size="lg">
				<Link to="/">Go back home</Link>
			</Button>
		</div>
	);
}
