interface CacheEntry {
	value: string;
	expiresAt: number;
}

const cache = new Map<string, CacheEntry>();
const tagToKeys = new Map<string, Set<string>>();

const PUBLIC_CACHE_CONTROL =
	"public, max-age=60, s-maxage=60, stale-while-revalidate=300";
const PRIVATE_CACHE_CONTROL =
	"private, max-age=60, stale-while-revalidate=300";

async function setCacheControlHeader(value: string) {
	// Dynamic import keeps the server-only module out of the client bundle.
	// eslint-disable-next-line @typescript-eslint/no-shadow
	const { setResponseHeader } = await import("@tanstack/react-start/server");
	setResponseHeader("Cache-Control", value);
}

export async function setPublicCacheHeaders() {
	return setCacheControlHeader(PUBLIC_CACHE_CONTROL);
}

export async function setPrivateCacheHeaders() {
	return setCacheControlHeader(PRIVATE_CACHE_CONTROL);
}

export async function getCached<T>(
	key: string,
	tags: string[],
	fn: () => Promise<T>,
	ttlSeconds = 3600,
): Promise<T> {
	const now = Date.now();
	const cached = cache.get(key);

	if (cached != null) {
		if (cached.expiresAt > now) {
			return JSON.parse(cached.value) as T;
		}
		// Expired entry; remove it and its tag mappings lazily
		cache.delete(key);
		for (const tag of tags) {
			tagToKeys.get(tag)?.delete(key);
		}
	}

	const value = await fn();

	const entry: CacheEntry = {
		value: JSON.stringify(value),
		expiresAt: now + ttlSeconds * 1000,
	};
	cache.set(key, entry);

	for (const tag of tags) {
		let keys = tagToKeys.get(tag);
		if (keys == null) {
			keys = new Set<string>();
			tagToKeys.set(tag, keys);
		}
		keys.add(key);
	}

	return value;
}

export async function revalidateTag(tag: string) {
	const keys = tagToKeys.get(tag);
	if (keys == null || keys.size === 0) return;

	for (const key of keys) {
		cache.delete(key);
	}
	tagToKeys.delete(tag);
}

export async function revalidateTags(tags: string[]) {
	await Promise.all(tags.map((tag) => revalidateTag(tag)));
}

/**
 * Remove all expired entries and clean up empty tag mappings.
 * Safe to call periodically; ignored errors won't affect requests.
 */
export function cleanupExpiredCache() {
	const now = Date.now();
	for (const [key, entry] of cache) {
		if (entry.expiresAt <= now) {
			cache.delete(key);
		}
	}

	for (const [tag, keys] of tagToKeys) {
		for (const key of keys) {
			if (!cache.has(key)) {
				keys.delete(key);
			}
		}
		if (keys.size === 0) {
			tagToKeys.delete(tag);
		}
	}
}
