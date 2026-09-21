import { createAuthClient } from "better-auth/react";
import {
  inferAdditionalFields,
  adminClient,
  usernameClient,
  lastLoginMethodClient,
} from "better-auth/client/plugins";
import type { auth } from "./auth";
import { admin, user, ac } from "./auth-permissions";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_SERVER_URL,
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
