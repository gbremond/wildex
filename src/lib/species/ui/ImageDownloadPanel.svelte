<script lang="ts">
	import { onMount } from 'svelte';
	import { cacheSpeciesImages, countCachedImages } from '../data/image-cache';
	import { getSpeciesList } from '../data/repository';
	import { Button } from '$lib/components/ui/button';
	import { m } from '$lib/paraglide/messages';

	let cachedCount = $state<number | null>(null);
	let isDownloading = $state(false);
	let progress = $state<{ done: number; total: number } | null>(null);
	let failedCount = $state(0);

	onMount(refreshCachedCount);

	async function refreshCachedCount() {
		cachedCount = await countCachedImages();
	}

	async function downloadImages() {
		isDownloading = true;
		progress = null;
		failedCount = 0;

		try {
			const report = await cacheSpeciesImages(await getSpeciesList(), (done, total) => {
				progress = { done, total };
			});

			failedCount = report.failed;
			await refreshCachedCount();
		} finally {
			isDownloading = false;
		}
	}
</script>

<Button onclick={downloadImages} disabled={isDownloading}>
	{isDownloading
		? m.downloads_images_progress({ done: progress?.done ?? 0, total: progress?.total ?? 0 })
		: m.downloads_images_start()}
</Button>

<p>{m.downloads_images_stored({ count: cachedCount ?? 0 })}</p>

{#if failedCount}
	<p>{m.downloads_images_failed({ count: failedCount })}</p>
{/if}
