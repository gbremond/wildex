import type { Species } from './species.model';
import { speciesImageUrl } from './species-image';

export const BIRD_IMAGE_CACHE = 'bird-images-v1';
const CONCURRENCY = 6;

async function runWithConcurrencyLimit<T>(
	items: T[],
	limit: number,
	task: (item: T) => Promise<void>
): Promise<void> {
	let nextIndex = 0;

	async function worker() {
		while (nextIndex < items.length) {
			await task(items[nextIndex++]);
		}
	}

	await Promise.all(Array.from({ length: limit }, worker));
}

async function cacheImage(cache: Cache, url: string): Promise<void> {
	try {
		const response = await fetch(url, { mode: 'no-cors' });
		await cache.put(url, response);
	} catch {
		// Skip on network failure; the rest of the batch should still complete.
	}
}

export async function cacheSpeciesImages(
	speciesList: Species[],
	onProgress?: (done: number, total: number) => void
): Promise<void> {
	const cache = await caches.open(BIRD_IMAGE_CACHE);
	const urls = speciesList.flatMap((species) => [
		speciesImageUrl(species.scientificName, 'thumb'),
		speciesImageUrl(species.scientificName, 'medium')
	]);

	let done = 0;

	await runWithConcurrencyLimit(urls, CONCURRENCY, async (url) => {
		await cacheImage(cache, url);
		onProgress?.(++done, urls.length);
	});
}

export async function countCachedImages(): Promise<number> {
	const cache = await caches.open(BIRD_IMAGE_CACHE);

	return (await cache.keys()).length;
}
