<script lang="ts">
	import { onMount } from 'svelte';
	import { cacheSpeciesImages, countCachedImages } from '../data/image-cache';
	import { getSpeciesList } from '../data/repository';
	import { Button } from '$lib/components/ui/button';

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
		? `Downloading images… ${progress?.done ?? 0}/${progress?.total ?? 0}`
		: 'Download images'}
</Button>

<p>{cachedCount ?? 0} images stored offline</p>

{#if failedCount}
	<p>{failedCount} images could not be downloaded — check your connection and retry.</p>
{/if}
