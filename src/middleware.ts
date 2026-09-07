import { createMiddleware } from "@tanstack/react-start";
import {
	resolveUserCountry,
	setUserCountryHeader,
} from "./lib/userCountryHeader";

export const countryMiddleware = createMiddleware().server(
	async ({ next, request }) => {
		try {
			setUserCountryHeader(
				request.headers,
				resolveUserCountry(request.headers),
			);
		} catch (error) {
			console.warn("Could not set country header on request", error);
		}

		return next();
	},
);
