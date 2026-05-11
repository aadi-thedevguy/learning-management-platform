import { ClerkProvider } from "@clerk/tanstack-react-start";
import {
	createRootRoute,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/toaster";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ title: "Course Platform" },
		],
		links: [{ rel: "stylesheet", href: appCss }],
	}),
	shellComponent: RootDocument,
	component: RootComponent,
});

function RootComponent() {
	return <Outlet />;
}

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<ClerkProvider>
			<html lang="en">
				<head>
					<HeadContent />
				</head>
				<body className="antialiased mx-auto p-4">
					{children}
					<Toaster />
					<Scripts />
				</body>
			</html>
		</ClerkProvider>
	);
}
