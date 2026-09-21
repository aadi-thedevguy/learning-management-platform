import { useState } from "react";
import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { DropdownMenu } from "radix-ui";
import { ChevronDown, LogOut, UserRound } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/UserAvatar";
import { toast } from "@/hooks/use-toast";

export function UserMenu() {
  const { data: session } = authClient.useSession();
  const [pending, setPending] = useState(false);
  const navigate = useNavigate();
  const router = useRouter();
  if (!session?.user) return null;
  async function signOut() {
    setPending(true);
    try {
      const result = await authClient.signOut();
      if (result.error) throw new Error(result.error.message);
      await navigate({ to: "/" });
      await router.invalidate();
    } catch {
      toast({ title: "Unable to log out", description: "Please try again.", variant: "destructive" });
    } finally { setPending(false); }
  }
  const itemClass = "flex items-center gap-2 rounded px-3 py-2 text-sm outline-none focus:bg-accent cursor-pointer";
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button variant="ghost" className="self-center gap-2" aria-label="Open user menu">
          <UserAvatar user={session.user} /><ChevronDown className="size-4" />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="end" sideOffset={8} className="z-50 w-60 rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
          <DropdownMenu.Label className="px-3 py-2 truncate">{session.user.name}</DropdownMenu.Label>
          <DropdownMenu.Separator className="my-1 h-px bg-border" />
          <DropdownMenu.Item asChild className={itemClass}><Link to="/profile"><UserRound className="size-4" />Profile</Link></DropdownMenu.Item>
          <DropdownMenu.Item disabled={pending} onSelect={() => void signOut()} className={itemClass}><LogOut className="size-4" />{pending ? "Logging out…" : "Log out"}</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
