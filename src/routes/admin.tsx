import {
	createFileRoute,
	Link,
	Outlet,
	notFound,
	useNavigate,
} from "@tanstack/react-router";
import { Home, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/admin")({
	beforeLoad: ({ context }) => {
		if (context.role !== "admin") {
			throw notFound();
		}
	},
	component: AdminLayout,
});

function AdminLayout() {
	return (
		<>
			<Navbar />
			<section className="container my-6 px-4 mx-auto">
				<Outlet />
			</section>
		</>
	);
}

function Navbar() {
	return (
		<header className="flex w-full h-12 shadow bg-background z-10">
			<nav className="flex gap-4 container py-4 px-10">
				<div className="mr-auto flex items-center gap-2">
					<Link className="hidden md:block text-lg hover:underline" to="/admin">
						LMS
					</Link>
					<Link className="block md:hidden text-lg hover:underline" to="/admin">
						<Home />
					</Link>
					<Badge>Admin</Badge>
				</div>
				<Link
					className="hover:bg-accent/10 flex items-center px-2"
					to="/admin/courses"
				>
					Courses
				</Link>
				<Link
					className="hover:bg-accent/10 flex items-center px-2"
					to="/admin/products"
				>
					Products
				</Link>
				<Link
					className="hover:bg-accent/10 flex items-center px-2"
					to="/admin/sales"
				>
					Sales
				</Link>
				<SignOutButton />
			</nav>
		</header>
	);
}

function SignOutButton() {
	const navigate = useNavigate();

	return (
		<Button
			variant="ghost"
			size="icon"
			className="self-center"
			onClick={async () => {
				await authClient.signOut();
				navigate({ to: "/" });
			}}
		>
			<LogOut className="h-4 w-4" />
		</Button>
	);
}
