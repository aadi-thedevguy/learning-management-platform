/**
 * Cache-tag shim.
 *
 * This project uses explicit cache tags passed to `getCached` in `src/lib/cache.ts`.
 * Keeping this shim as a no-op avoids breaking any call sites while the actual
 * tagging is handled by the cache helper.
 */
export function cacheTag(..._tags: string[]) {}
