import { createStart } from "@tanstack/react-start";
import { countryMiddleware } from "./middleware";

export const startInstance = createStart(() => ({
	requestMiddleware: [countryMiddleware],
}));
