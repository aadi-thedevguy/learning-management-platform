import { useUser } from "@clerk/tanstack-react-start";
import type { ReactNode } from "react";
import type { UserRole } from "@/drizzle/schema";

export function HasPermission({
	permission,
	children,
}: {
	permission: (user: { role: UserRole | undefined }) => boolean;
	children: ReactNode;
}) {
	const { user } = useUser();
	const role = user?.publicMetadata?.role as UserRole | undefined;

	if (permission({ role })) {
		return <>{children}</>;
	}

	return null;
}
