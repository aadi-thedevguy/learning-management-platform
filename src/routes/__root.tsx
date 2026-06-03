import { ClerkProvider } from "@clerk/tanstack-react-start";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { auth } from "@clerk/tanstack-react-start/server";
import { ErrorComponent } from "@/components/ErrorComponent";
import { NotFoundComponent } from "@/components/NotFoundComponent";
import { Toaster } from "@/components/ui/toaster";
import appCss from "../styles.css?url";

interface MyRouterContext {
  userId: string | null | undefined;
  role: string | null | undefined;
}

const fetchClerkAuth = createServerFn({ method: "GET" }).handler(async () => {
  const { userId, sessionClaims } = await auth();
  return {
    userId,
    role: sessionClaims?.role as string | undefined,
  };
});

export const Route = createRootRouteWithContext<MyRouterContext>()({
  beforeLoad: async () => {
    const { userId, role } = await fetchClerkAuth();
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
    <ClerkProvider>
      <RootDocument>
        <Outlet />
      </RootDocument>
    </ClerkProvider>
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
