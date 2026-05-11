import { Show, SignInButton, UserButton } from "@clerk/tanstack-react-start";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { HomeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_consumer")({
	component: ConsumerLayout,
});

function ConsumerLayout() {
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
					<Show when="signed-in">
						<Link
							className="hover:bg-accent/10 flex items-center px-2"
							to="/admin"
						>
							Admin
						</Link>
						{/* <Link
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
						</Link> */}
						<div className="size-8 self-center">
							<UserButton
								appearance={{
									elements: {
										userButtonAvatarBox: { width: "100%", height: "100%" },
									},
								}}
							/>
						</div>
					</Show>
					<Show when="signed-out">
						<Button className="self-center" asChild>
							<SignInButton>Sign In</SignInButton>
						</Button>
					</Show>
				</nav>
			</header>
			<main className="container my-6 px-4 mx-auto">
				<Outlet />
			</main>
		</>
	);
}
