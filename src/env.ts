import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	server: {
		DB_URL: z.string().min(1),
		CLERK_SECRET_KEY: z.string().min(1),
		CLERK_WEBHOOK_SECRET: z.string().min(1),
		CLERK_SIGN_IN_URL: z.string().min(1),
		CLERK_SIGN_UP_URL: z.string().min(1),
		ARCJET_KEY: z.string().min(1),
		TEST_IP_ADDRESS: z.string().min(1).optional(),
		DODOPAYMENTS_API_KEY: z.string().min(1),
		DODOPAYMENTS_WEBHOOK_SECRET: z.string().min(1),
		PPP_50_COUPON_ID: z.string().min(1),
		PPP_40_COUPON_ID: z.string().min(1),
		PPP_30_COUPON_ID: z.string().min(1),
		PPP_20_COUPON_ID: z.string().min(1),
	},

	/**
	 * The prefix that client-side variables must have. This is enforced both at
	 * a type-level and at runtime.
	 */
	clientPrefix: "VITE_",

	client: {
		VITE_SERVER_URL: z.url(),
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
