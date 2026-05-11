import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@/drizzle/schema";
import { env } from "@/env";

export const db = drizzle(env.DB_URL, {
	schema,
});
