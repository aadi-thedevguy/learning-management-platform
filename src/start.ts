import { createStart } from "@tanstack/react-start";
import { arcjetMiddleware } from "./middleware";

export const startInstance = createStart(() => ({
	requestMiddleware: [arcjetMiddleware],
}));
