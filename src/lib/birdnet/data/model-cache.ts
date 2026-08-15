import { base } from '$app/paths';
import { BIRDNET_CACHE, birdnetAssetUrls } from './models';

export type ModelDownloadReport = { requested: number; failed: number };

/**
 * Writes into the cache directly rather than leaning on the service worker to
 * intercept: on a first visit the worker has installed but does not yet control
 * the page, so nothing it would have cached actually gets stored.
 *
 * One at a time on purpose — these are tens of megabytes each, and six parallel
 * downloads of that size is a good way to get a phone tab killed.
 */
export async function downloadBirdnetModels(
	onProgress?: (done: number, total: number) => void
): Promise<ModelDownloadReport> {
	const cache = await caches.open(BIRDNET_CACHE);
	const urls = birdnetAssetUrls(base);
	let failed = 0;

	for (const [index, url] of urls.entries()) {
		try {
			// add() fetches and stores in one step, per entry, so a single failure
			// costs that file rather than the whole download.
			await cache.add(url);
		} catch {
			failed++;
		}

		onProgress?.(index + 1, urls.length);
	}

	return { requested: urls.length, failed };
}

export async function countCachedBirdnetAssets(): Promise<number> {
	const cache = await caches.open(BIRDNET_CACHE);

	return (await cache.keys()).length;
}

export async function isBirdnetDownloaded(): Promise<boolean> {
	return (await countCachedBirdnetAssets()) >= birdnetAssetUrls(base).length;
}

export async function totalBirdnetAssets(): Promise<number> {
	return birdnetAssetUrls(base).length;
}
