import { BIRD_IMAGE_CACHE } from './species/species-image';

// Downloaded photos are the user's data, not a build artefact: a deployment
// invalidates the app shell but must never evict them.
const DURABLE_CACHES: string[] = [BIRD_IMAGE_CACHE];

export function isObsoleteCache(key: string, currentAppCache: string): boolean {
	return key !== currentAppCache && !DURABLE_CACHES.includes(key);
}
