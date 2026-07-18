import { createAuthClient } from "better-auth/react";
import {
	inferAdditionalFields,
	adminClient,
	usernameClient,
	lastLoginMethodClient,
} from "better-auth/client/plugins";
import { auth, admin, user, ac } from "./auth";

export const authClient = createAuthClient({
	baseURL: "/api/auth",
	plugins: [
		inferAdditionalFields<typeof auth>(),
		usernameClient(),
		lastLoginMethodClient(),
		adminClient({
			ac,
			roles: {
				admin,
				user,
			},
		}),
	],
});
