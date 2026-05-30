import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { admin as adminPlugin } from "better-auth/plugins/admin";
import { env } from "@/env";
import { haveIBeenPwned, lastLoginMethod, username } from "better-auth/plugins";
import { sendEmailVerificationEmail } from "@/emails/email-verification";
import { sendPasswordResetEmail } from "@/emails/password-reset";
import { createAccessControl } from "better-auth/plugins/access";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import {
  defaultStatements,
  userAc,
  adminAc,
} from "better-auth/plugins/admin/access";
import { db } from "@/drizzle/db";

export const ac = createAccessControl(defaultStatements);
export const user = ac.newRole({
  ...userAc.statements,
  user: [...userAc.statements.user],
});

export const admin = ac.newRole(adminAc.statements);

export const auth = betterAuth({
  appName: "Learning Management Platform",
  user: {
    changeEmail: {
      enabled: true,
      sendChangeEmailVerification: async ({
        user,
        url,
        newEmail,
      }: {
        user: any;
        url: string;
        newEmail: string;
      }) => {
        await sendEmailVerificationEmail({
          user: { ...user, email: newEmail },
          url,
        });
      },
    },
    deleteUser: {
      enabled: true,
    },
    additionalFields: {
      favoriteNumber: {
        type: "number",
        required: true,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }: { user: any; url: string }) => {
      await sendPasswordResetEmail({ user, url });
    },
  },
  emailVerification: {
    autoSignInAfterVerification: true,
    sendOnSignUp: true,
    sendVerificationEmail: async ({
      user,
      url,
    }: {
      user: any;
      url: string;
    }) => {
      await sendEmailVerificationEmail({ user, url });
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
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60, // 1 minute
    },
  },
  plugins: [
    tanstackStartCookies(),
    username(),
    haveIBeenPwned(),
    lastLoginMethod({
      storeInDatabase: true,
    }),
    adminPlugin({
      ac,
      roles: {
        admin,
        user,
      },
    }),
  ],

  trustedOrigins: [env.BETTER_AUTH_URL],
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
});
