import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { ErrorComponent } from "@/components/ErrorComponent";
import { NotFoundComponent } from "@/components/NotFoundComponent";
import { Toaster } from "@/components/ui/toaster";
import { auth } from "@/lib/auth";
import appCss from "../styles.css?url";

interface MyRouterContext {
	userId: string | null | undefined;
	role: string | null | undefined;
}

const fetchAuth = createServerFn({ method: "GET" }).handler(async () => {
	const headers = getRequestHeaders();
	const session = await auth.api.getSession({ headers });
	return {
		userId: session?.user.id,
		role: session?.user.role as string | undefined,
	};
});

export const Route = createRootRouteWithContext<MyRouterContext>()({
	beforeLoad: async () => {
		const { userId, role } = await fetchAuth();
		return { userId, role };
	},
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ title: "Course Platform" },
		],
		links: [{ rel: "stylesheet", href: appCss }],
	}),
	notFoundComponent: () => <NotFoundComponent />,
	errorComponent: ({ error }) => <ErrorComponent error={error} />,
	component: RootComponent,
});

function RootComponent() {
	return (
		<RootDocument>
			<Outlet />
		</RootDocument>
	);
}

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body className="antialiased">
				{children}
				<Toaster />
				<Scripts />
			</body>
		</html>
	);
}
