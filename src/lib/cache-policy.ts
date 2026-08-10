import { SPECIES_IMAGE_CACHE } from './species/data/image';

// Downloaded photos are the user's data, not a build artefact: a deployment
// invalidates the app shell but must never evict them.
const DURABLE_CACHES: string[] = [SPECIES_IMAGE_CACHE];

export function isObsoleteCache(key: string, currentAppCache: string): boolean {
	return key !== currentAppCache && !DURABLE_CACHES.includes(key);
}

// GitHub Pages does not serve dotfiles: caching `.nojekyll` would 404 and reject the
// whole install.
function isServable(file: string): boolean {
	return !file.endsWith('/.nojekyll');
}

// Hashed build output and static files never change under a given URL, so a cached copy
// is always correct. A prerendered page does: its URL outlives the deployment that wrote
// it, and it names that deployment's hashed assets. Serving one from cache would pin the
// app to an old version, so pages are precached for offline use but always revalidated.
export function toCachePolicy(
	build: string[],
	files: string[],
	prerendered: string[]
): { precache: string[]; cacheFirst: string[] } {
	const cacheFirst = [...build, ...files.filter(isServable)];

	return { precache: [...cacheFirst, ...prerendered], cacheFirst };
}
