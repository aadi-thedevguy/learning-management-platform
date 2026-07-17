import { betterAuth } from "better-auth";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { admin as adminPlugin } from "better-auth/plugins/admin";
import { createAccessControl } from "better-auth/plugins/access";
import {
	defaultStatements,
	userAc,
	adminAc,
} from "better-auth/plugins/admin/access";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { db } from "@/drizzle/db";
import { env } from "@/env";
import { sendEmail } from "@/services/email";
import { upsertUser } from "@/features/users/db/users";

export const ac = createAccessControl(defaultStatements);
export const user = ac.newRole({
	...userAc.statements,
	user: [...userAc.statements.user],
});

export const admin = ac.newRole(adminAc.statements);

export const auth = betterAuth({
	appName: "Learning Management Platform",
	secret: env.BETTER_AUTH_SECRET,
	baseURL: env.BETTER_AUTH_URL,
	trustedOrigins: [env.BETTER_AUTH_URL],
	database: drizzleAdapter(db, {
		provider: "pg",
	}),
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: true,
		sendResetPassword: async ({ user, url }) => {
			await sendEmail({
				to: user.email,
				subject: "Reset your password",
				html: `<p>Hi ${user.name},</p><p>Click <a href="${url}">here</a> to reset your password.</p>`,
				text: `Hi ${user.name},\n\nReset your password: ${url}`,
			});
		},
	},
	emailVerification: {
		autoSignInAfterVerification: true,
		sendOnSignUp: true,
		sendVerificationEmail: async ({ user, url }) => {
			await sendEmail({
				to: user.email,
				subject: "Verify your email",
				html: `<p>Hi ${user.name},</p><p>Click <a href="${url}">here</a> to verify your email.</p>`,
				text: `Hi ${user.name},\n\nVerify your email: ${url}`,
			});
		},
	},
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 60,
		},
	},
	plugins: [
		tanstackStartCookies(),
		adminPlugin({
			ac,
			roles: {
				admin,
				user,
			},
		}),
	],
	databaseHooks: {
		user: {
			create: {
				after: async (user) => {
					await upsertUser({
						authUserId: user.id,
						email: user.email,
						name: user.name,
						imageUrl: user.image,
						role: (user.role as "user" | "admin") || "user",
					});
				},
			},
			update: {
				after: async (user) => {
					await upsertUser({
						authUserId: user.id,
						email: user.email,
						name: user.name,
						imageUrl: user.image,
						role: (user.role as "user" | "admin") || "user",
					});
				},
			},
		},
	},
});
