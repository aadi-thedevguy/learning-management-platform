import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";

export const redis = new Redis(redisUrl, {
	maxRetriesPerRequest: 3,
	enableReadyCheck: false,
});

const TAG_KEYS_PREFIX = "cache:tag:";

export async function getCached<T>(
	key: string,
	tags: string[],
	fn: () => Promise<T>,
	ttlSeconds = 3600,
): Promise<T> {
	try {
		const cached = await redis.get(key);
		if (cached != null) {
			return JSON.parse(cached) as T;
		}
	} catch {
		// Ignore Redis errors; fall through to recompute
	}

	const value = await fn();

	try {
		const pipeline = redis.pipeline();
		pipeline.set(key, JSON.stringify(value), "EX", ttlSeconds);
		for (const tag of tags) {
			pipeline.sadd(`${TAG_KEYS_PREFIX}${tag}`, key);
			pipeline.expire(`${TAG_KEYS_PREFIX}${tag}`, ttlSeconds);
		}
		await pipeline.exec();
	} catch {
		// Ignore Redis errors
	}

	return value;
}

export async function revalidateTag(tag: string) {
	try {
		const keys = await redis.smembers(`${TAG_KEYS_PREFIX}${tag}`);
		if (keys.length === 0) return;

		const pipeline = redis.pipeline();
		for (const key of keys) {
			pipeline.del(key);
		}
		pipeline.del(`${TAG_KEYS_PREFIX}${tag}`);
		await pipeline.exec();
	} catch {
		// Ignore Redis errors
	}
}

export async function revalidateTags(tags: string[]) {
	await Promise.all(tags.map((tag) => revalidateTag(tag)));
}
