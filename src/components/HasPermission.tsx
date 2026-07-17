import { authClient } from "@/lib/auth-client";
import type { ReactNode } from "react";
import type { UserRole } from "@/drizzle/schema";

export function HasPermission({
	permission,
	children,
}: {
	permission: (user: { role: UserRole | undefined }) => boolean;
	children: ReactNode;
}) {
	const { data: session } = authClient.useSession();
	const role = session?.user?.role as UserRole | undefined;

	if (permission({ role })) {
		return <>{children}</>;
	}

	return null;
}
