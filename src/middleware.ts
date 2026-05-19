import arcjet, { detectBot, shield, slidingWindow } from "@arcjet/node";
import { createMiddleware } from "@tanstack/react-start";
import { env } from "./env";
import { setUserCountryHeader } from "./lib/userCountryHeader";

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

// export const authMiddleware = createMiddleware().server(async ({ next }) => {
// 	const { userId, isAuthenticated } = await auth();
// 	if (!isAuthenticated) {
// 		throw new Error("Unauthorized");
// 	}
// 	return next({ context: { userId } });
// });

// export const adminMiddleware = authMiddleware.server(
// 	async ({ next, context }) => {
// 		const { sessionClaims } = await auth();
// 		if (sessionClaims?.role !== "admin") {
// 			throw new Error("Forbidden");
// 		}
// 		return next({ context });
// 	},
// );


export const arcjetMiddleware = createMiddleware().server(
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
