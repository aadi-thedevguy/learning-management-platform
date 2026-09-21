import { useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { UserAvatar } from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const Route = createFileRoute("/_consumer/_authed/profile")({ component: ProfilePage });

function ProfilePage() {
  const { data: session, isPending, refetch } = authClient.useSession();
  if (isPending) return <p role="status">Loading profile…</p>;
  if (!session?.user) return <p>Please sign in to manage your profile.</p>;
  return <ProfileDetails key={`${session.user.id}:${session.user.email}`} user={session.user} refresh={async () => { await refetch(); }} />;
}

function ProfileDetails({ user, refresh }: { user: typeof authClient.$Infer.Session.user; refresh: () => Promise<void> }) {
  const [username, setUsername] = useState(user.username || "");
  const [email, setEmail] = useState(user.email);
  const [pending, setPending] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  async function update(action: string, request: () => Promise<{ error: { message?: string } | null }>, success: string) {
    setPending(action); setMessage(""); setError("");
    try {
      const result = await request();
      if (result.error) throw new Error(result.error.message || "Unable to update your profile.");
      setMessage(success);
      if (action === "username") { await refresh(); await router.invalidate(); }
    } catch (err) { setError(err instanceof Error ? err.message : "Something went wrong. Please try again."); }
    finally { setPending(null); }
  }
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex items-center gap-4"><UserAvatar user={user} className="size-20" /><div><h1 className="text-2xl font-semibold">Your profile</h1><p className="text-muted-foreground">{user.name}</p></div></div>
      {message && <p role="status" className="text-sm">{message}</p>}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <Card><CardHeader><CardTitle>Username</CardTitle><CardDescription>Use your username or email to log in with a password.</CardDescription></CardHeader><CardContent>
        <form className="space-y-3" onSubmit={(event) => { event.preventDefault(); void update("username", () => authClient.updateUser({ username: username.trim(), displayUsername: username.trim() }), "Username updated."); }}>
          <Label htmlFor="profile-username">Username</Label><Input id="profile-username" value={username} onChange={(event) => setUsername(event.target.value)} required minLength={3} maxLength={30} pattern="[a-zA-Z0-9_.]+" title="3–30 letters, numbers, underscores, or periods" autoComplete="username" />
          <Button disabled={!!pending || username.trim() === user.username}>{pending === "username" ? "Saving…" : "Save username"}</Button>
        </form>
      </CardContent></Card>
      <Card><CardHeader><CardTitle>Email address</CardTitle><CardDescription>Your email changes after you verify the new address.</CardDescription></CardHeader><CardContent>
        <form className="space-y-3" onSubmit={(event) => { event.preventDefault(); void update("email", () => authClient.changeEmail({ newEmail: email.trim(), callbackURL: "/profile" }), "Check your new inbox for the verification link. Your current email stays active until verification."); }}>
          <Label htmlFor="profile-email">Email</Label><Input id="profile-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
          <Button disabled={!!pending || email.trim() === user.email}>{pending === "email" ? "Sending…" : "Change email"}</Button>
        </form>
      </CardContent></Card>
      <Card><CardHeader><CardTitle>Password</CardTitle><CardDescription>Send a password reset link to {user.email}.</CardDescription></CardHeader><CardContent>
        <Button disabled={!!pending} onClick={() => void update("password", () => authClient.requestPasswordReset({ email: user.email, redirectTo: "/reset-password" }), "Password reset requested. Check your inbox for the next steps.")}>{pending === "password" ? "Sending…" : "Send password reset link"}</Button>
      </CardContent></Card>
    </div>
  );
}
