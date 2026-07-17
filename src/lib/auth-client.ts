import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields, adminClient } from "better-auth/client/plugins";
import { auth, admin, user, ac } from "./auth";

export const authClient = createAuthClient({
	baseURL: "/api/auth",
	plugins: [
		inferAdditionalFields<typeof auth>(),
		adminClient({
			ac,
			roles: {
				admin,
				user,
			},
		}),
	],
});
