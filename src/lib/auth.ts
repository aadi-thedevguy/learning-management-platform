import "@tanstack/react-start/server-only";
import { ac, admin, user } from "./auth-permissions";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { admin as adminPlugin } from "better-auth/plugins/admin";
import { username, lastLoginMethod } from "better-auth/plugins";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { db } from "@/drizzle/db";
import {
  AccountTable,
  SessionTable,
  UserTable,
  VerificationTable,
} from "@/drizzle/schema";
import { env } from "@/env";
import { sendEmailVerificationEmail } from "./emails/verification-email";
import { sendPasswordResetEmail } from "./emails/send-password-email";

export const auth = betterAuth({
  appName: "Learning Management Platform",
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: [env.BETTER_AUTH_URL],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: UserTable,
      session: SessionTable,
      account: AccountTable,
      verification: VerificationTable,
    },
  }),
  user: {
    changeEmail: { enabled: true },
    additionalFields: {
      role: {
        type: ["user", "admin"],
        required: false,
        defaultValue: "user",
        input: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail({ user, url });
    },
  },
  emailVerification: {
    autoSignInAfterVerification: true,
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmailVerificationEmail({ user, url });
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60,
    },
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      mapProfileToUser: (profile) => {
        return {
          username: profile.name,
          image: profile.picture,
          favoriteNumber: Math.floor(Math.random() * 100),
        };
      },
    },
  },
  plugins: [
    username(),
    lastLoginMethod(),
    adminPlugin({
      ac,
      roles: {
        admin,
        user,
      },
    }),
    tanstackStartCookies(),
  ],
});
