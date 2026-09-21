import { useState } from "react";
import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

export function GoogleSignIn({ callbackURL, errorPath, error, disabled }: {
  callbackURL: string;
  errorPath: "/login" | "/signup";
  error?: string;
  disabled?: boolean;
}) {
  const [pending, setPending] = useState(false);

  async function signIn() {
    setPending(true);
    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL,
        errorCallbackURL: `${errorPath}?redirect=${encodeURIComponent(callbackURL)}`,
      });
      if (result.error) throw new Error(result.error.message || "Google sign-in failed");
    } catch (error) {
      toast({
        title: "Google sign-in failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
      setPending(false);
    }
  }

  return (
    <div className="space-y-4 mb-4">
      {error && <p role="alert" className="text-sm text-destructive">Google sign-in could not be completed. Please try again or use email.</p>}
      <Button type="button" variant="outline" className="w-full" disabled={pending || disabled} onClick={signIn} aria-busy={pending}>
        {pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
        {pending ? "Connecting to Google…" : "Continue with Google"}
      </Button>
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-border" />
        <span>or continue with email</span>
        <div className="h-px flex-1 bg-border" />
      </div>
    </div>
  );
}
