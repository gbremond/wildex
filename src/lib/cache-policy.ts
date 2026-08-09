import { SPECIES_IMAGE_CACHE } from './species/data/image';

// Downloaded photos are the user's data, not a build artefact: a deployment
// invalidates the app shell but must never evict them.
const DURABLE_CACHES: string[] = [SPECIES_IMAGE_CACHE];

export function isObsoleteCache(key: string, currentAppCache: string): boolean {
	return key !== currentAppCache && !DURABLE_CACHES.includes(key);
}
