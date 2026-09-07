import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	server: {
		NODE_ENV: z.enum(["development", "production"]),
		DB_URL: z.string().min(1),
		BETTER_AUTH_SECRET: z.string().min(1),
		BETTER_AUTH_URL: z.string().min(1),
		AWS_ACCESS_KEY_ID: z.string().min(1),
		AWS_SECRET_ACCESS_KEY: z.string().min(1),
		AWS_REGION: z.string().min(1),
		S3_BUCKET_NAME: z.string().min(1),
		CLOUDFRONT_DOMAIN: z.string().min(1),
		SES_FROM_EMAIL: z.string().min(1),
		DODOPAYMENTS_API_KEY: z.string().min(1),
		DODOPAYMENTS_WEBHOOK_SECRET: z.string().min(1),
		PPP_50_COUPON_ID: z.string().min(1),
		PPP_40_COUPON_ID: z.string().min(1),
		PPP_30_COUPON_ID: z.string().min(1),
		PPP_20_COUPON_ID: z.string().min(1),
		SERVER_URL: z.url(),
		GOOGLE_CLIENT_ID: z.string().min(1),
		GOOGLE_CLIENT_SECRET: z.string().min(1),
	},

	/**
	 * The prefix that client-side variables must have. This is enforced both at
	 * a type-level and at runtime.
	 */
	clientPrefix: "VITE_",

	client: {
		VITE_SERVER_URL: z.url(),
		VITE_SENTRY_DSN: z.string().optional(),
	},

	/**
	 * What object holds the environment variables at runtime. This is usually
	 * `process.env` or `import.meta.env`.
	 */
	runtimeEnv: typeof process !== "undefined" ? process.env : import.meta.env,

	/**
	 * By default, this library will feed the environment variables directly to
	 * the Zod validator.
	 *
	 * This means that if you have an empty string for a value that is supposed
	 * to be a number (e.g. `PORT=` in a ".env" file), Zod will incorrectly flag
	 * it as a type mismatch violation. Additionally, if you have an empty string
	 * for a value that is supposed to be a string with a default value (e.g.
	 * `DOMAIN=` in an ".env" file), the default value will never be applied.
	 *
	 * In order to solve these issues, we recommend that all new projects
	 * explicitly specify this option as true.
	 */
	emptyStringAsUndefined: true,
});
