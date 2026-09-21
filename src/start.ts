import { createStart } from "@tanstack/react-start";
import { countryMiddleware, csrfMiddleware } from "./middleware";

export const startInstance = createStart(() => ({
  requestMiddleware: [countryMiddleware, csrfMiddleware],
}));
