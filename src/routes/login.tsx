import { GoogleSignIn } from "@/components/GoogleSignIn";
import { authSearchSchema } from "@/lib/auth-search";
import {
  createFileRoute,
  Link,
  useNavigate,
} from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

const loginSchema = z.object({
  identifier: z.string().trim().min(1, "Enter your email or username"),
  password: z.string().min(8),
});

export const Route = createFileRoute("/login")({
  validateSearch: authSearchSchema,
  component: LoginComponent,
});

function LoginComponent() {
  const navigate = useNavigate();
  const { redirect, error } = Route.useSearch();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    try {
      const identifier = values.identifier;
      const result = identifier.includes("@")
        ? await authClient.signIn.email({ email: identifier, password: values.password, callbackURL: redirect || "/courses" })
        : await authClient.signIn.username({ username: identifier, password: values.password });
      if (result.error) {
        toast({ title: "Error", description: result.error.message || "Login failed", variant: "destructive" });
        return;
      }
      await navigate({ href: redirect || "/courses" });
    } catch {
      toast({ title: "Error", description: "Unable to log in. Please try again.", variant: "destructive" });
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email or username and password to access your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GoogleSignIn callbackURL={redirect || "/courses"} errorPath="/login" error={error} disabled={form.formState.isSubmitting} />
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="identifier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email or username</FormLabel>
                    <FormControl>
                      <Input {...field} type="text" autoComplete="username" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Password</FormLabel>
                      <Link
                        to="/forgot-password"
                        className="text-sm text-primary hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <FormControl>
                      <Input {...field} type="password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Logging in..." : "Login"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" search={{ redirect }} className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
