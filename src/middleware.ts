import arcjet, { detectBot, shield, slidingWindow } from "@arcjet/node";
import { auth } from "@clerk/tanstack-react-start/server";
import { createMiddleware } from "@tanstack/react-start";
import { env } from "./env";
import { setUserCountryHeader } from "./lib/userCountryHeader";

const createRouteMatcher = (patterns: string[]) => {
	const regexes = patterns.map(
		(pattern) =>
			new RegExp(
				`^${pattern.replace(/\(.*\)/g, ".*").replace(/:[^\s/]+/g, "([^/]+)")}$`,
			),
	);
	return (req: Request) => {
		const pathname = new URL(req.url).pathname;
		return regexes.some((r) => r.test(pathname));
	};
};

const isPublicRoute = createRouteMatcher([
	"/",
	"/sign-in(.*)",
	"/sign-up(.*)",
	"/api(.*)",
	"/courses/:courseId/lessons/:lessonId",
	"/products(.*)",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

const aj = arcjet({
	key: env.ARCJET_KEY,
	rules: [
		shield({ mode: "LIVE" }),
		detectBot({
			mode: "LIVE",
			allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:MONITOR", "CATEGORY:PREVIEW"],
		}),
		slidingWindow({
			mode: "LIVE",
			interval: "1m",
			max: 100,
		}),
	],
});

export const coreMiddleware = createMiddleware().server(
	async ({ next, request }) => {
		// biome-ignore lint/suspicious/noImplicitAnyLet: <explanation>
		let decision;
		if (env.TEST_IP_ADDRESS) {
			const reqCopy = new Request(request.url, request);
			reqCopy.headers.set("x-forwarded-for", env.TEST_IP_ADDRESS);
			decision = await aj.protect(reqCopy as any);
		} else {
			decision = await aj.protect(request as any);
		}

		if (decision.isDenied()) {
			return new Response(null, { status: 403 });
		}

		if (isAdminRoute(request)) {
			const { sessionClaims } = await auth();
			if (sessionClaims?.role !== "admin") {
				return new Response(null, { status: 404 });
			}
		}

		if (!isPublicRoute(request)) {
			const { isAuthenticated } = await auth();
			if (!isAuthenticated) {
				return new Response("Unauthorized", { status: 401 });
			}
		}

		if (!decision.ip.isVpn() && !decision.ip.isProxy()) {
			try {
				setUserCountryHeader(request.headers, decision.ip.country);
			} catch (e) {
				console.warn("Could not set country header on request", e);
			}
		}

		return next();
	},
);
