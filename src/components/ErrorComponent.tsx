import { Link } from "@tanstack/react-router";
import { AlertTriangle, HomeIcon, RefreshCwIcon } from "lucide-react";
import { Button } from "./ui/button";

export function ErrorComponent({ error }: { error?: unknown }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-6 text-center px-4">
      <div className="bg-destructive/10 rounded-full p-6">
        <AlertTriangle className="size-12 text-destructive" />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Something went wrong
        </h1>
        <p className="text-muted-foreground max-w-125">
          {error instanceof Error
            ? error.message
            : "An unexpected error occurred. Please try again later."}
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-4">
        <Button
          variant="outline"
          size="lg"
          onClick={() => window.location.reload()}
        >
          Try again
          <RefreshCwIcon className="size-4" />
        </Button>
        <Link to="/">
          <Button size="lg" className="flex items-center gap-2">
            Go back
            <HomeIcon className="size-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
