import { UserMenu } from "@/components/UserMenu";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { HomeIcon } from "lucide-react";
import { HasPermission } from "@/components/HasPermission";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { canAccessAdminPages } from "@/permissions/general";

export const Route = createFileRoute("/_consumer")({
	component: ConsumerLayout,
});

function ConsumerLayout() {
	const { data: session, isPending } = authClient.useSession();
	const isSignedIn = !!session?.user;

	return (
		<>
			<header className="flex w-full h-12 shadow bg-background z-10">
				<nav className="flex gap-4 container py-4 px-10">
					<Link
						className="mr-auto hidden text-lg hover:underline md:flex items-center"
						to="/"
					>
						LMS
					</Link>
					<Link
						className="mr-auto block text-lg hover:underline md:hidden"
						to="/"
					>
						<HomeIcon />
					</Link>
					{isPending ? null : isSignedIn ? (
						<>
							<HasPermission permission={canAccessAdminPages}>
								<Link
									className="hover:bg-accent/10 flex items-center px-2"
									to="/admin"
								>
									Admin
								</Link>
							</HasPermission>
							<Link
								className="hover:bg-accent/10 flex items-center px-2"
								to="/courses"
							>
								My Courses
							</Link>
							<Link
								className="hover:bg-accent/10 flex items-center px-2"
								to="/purchases"
							>
								Purchase History
							</Link>
							<UserMenu />
						</>
					) : (
						<Button className="self-center" asChild>
							<Link to="/login">Sign In</Link>
						</Button>
					)}
				</nav>
			</header>
			<main className="container my-6 px-4 mx-auto">
				<Outlet />
			</main>
		</>
	);
}
