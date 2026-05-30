import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/verify-email")({
  validateSearch: (search: Record<string, unknown>) => ({
    token: search.token as string | undefined,
  }),
  component: VerifyEmailComponent,
});

function VerifyEmailComponent() {
  const { token } = Route.useSearch();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }

    authClient.verifyEmail(
      { query: { token } },
      {
        onSuccess: () => {
          setStatus("success");
          toast.success("Email verified successfully!");
          setTimeout(() => navigate({ to: "/login" }), 2000);
        },
        onError: (ctx) => {
          setStatus("error");
          toast.error(ctx.error.message);
        },
      },
    );
  }, [token, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle>Email Verification</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          {status === "loading" && <Loader2 className="animate-spin h-8 w-8" />}
          {status === "success" && (
            <p>Your email has been verified! Redirecting to login...</p>
          )}
          {status === "error" && (
            <p className="text-destructive">
              Invalid or expired token. Please try again.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
