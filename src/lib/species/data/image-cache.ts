import type { Species } from '../model/model';
import { SPECIES_IMAGE_CACHE, speciesImageUrl } from './image';

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

// The service worker caches every species image it serves, so requesting one is
// all it takes to store it for offline use.
async function requestImage(url: string): Promise<boolean> {
	try {
		const response = await fetch(url, { mode: 'no-cors' });

		return response.type === 'opaque' || response.ok;
	} catch {
		return false;
	}
}

export type ImageDownloadReport = { requested: number; failed: number };

export async function cacheSpeciesImages(
	speciesList: Species[],
	onProgress?: (done: number, total: number) => void
): Promise<ImageDownloadReport> {
	const urls = speciesList.flatMap((species) => [
		speciesImageUrl(species.scientificName, 'thumb'),
		speciesImageUrl(species.scientificName, 'medium')
	]);

	let done = 0;
	let failed = 0;

	await runWithConcurrencyLimit(urls, CONCURRENCY, async (url) => {
		if (!(await requestImage(url))) failed++;

		onProgress?.(++done, urls.length);
	});

	return { requested: urls.length, failed };
}

export async function countCachedImages(): Promise<number> {
	const cache = await caches.open(SPECIES_IMAGE_CACHE);

	return (await cache.keys()).length;
}
