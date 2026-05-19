import { clerkMiddleware } from "@clerk/tanstack-react-start/server";
import { createStart } from "@tanstack/react-start";
import { arcjetMiddleware } from "./middleware";

export const startInstance = createStart(() => ({
	requestMiddleware: [clerkMiddleware(), arcjetMiddleware],
}));
