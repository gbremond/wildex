<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import {
		countCachedBirdnetAssets,
		downloadBirdnetModels,
		totalBirdnetAssets
	} from '../data/model-cache';

	const APPROXIMATE_SIZE = '105 MB';

	let cachedCount = $state<number | null>(null);
	let totalCount = $state(0);
	let isDownloading = $state(false);
	let progress = $state<{ done: number; total: number } | null>(null);
	let failedCount = $state(0);

	let isComplete = $derived(cachedCount !== null && totalCount > 0 && cachedCount >= totalCount);

	onMount(async () => {
		totalCount = await totalBirdnetAssets();
		await refreshCachedCount();
	});

	async function refreshCachedCount() {
		cachedCount = await countCachedBirdnetAssets();
	}

	async function downloadModels() {
		isDownloading = true;
		progress = null;
		failedCount = 0;

		try {
			const report = await downloadBirdnetModels((done, total) => {
				progress = { done, total };
			});

			failedCount = report.failed;
			await refreshCachedCount();
		} finally {
			isDownloading = false;
		}
	}
</script>

<Button onclick={downloadModels} disabled={isDownloading}>
	{isDownloading
		? `Downloading sound detection… ${progress?.done ?? 0}/${progress?.total ?? 0}`
		: isComplete
			? 'Re-download sound detection'
			: `Download sound detection (${APPROXIMATE_SIZE})`}
</Button>

<p>
	{#if isComplete}
		Sound detection available offline
	{:else}
		Sound detection not downloaded — {cachedCount ?? 0}/{totalCount} files
	{/if}
</p>

{#if failedCount}
	<p>{failedCount} files could not be downloaded — check your connection and retry.</p>
{/if}
