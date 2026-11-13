<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import {
		countCachedBirdnetAssets,
		downloadBirdnetModels,
		totalBirdnetAssets
	} from '../data/model-cache';
	import { m } from '$lib/paraglide/messages';

	const APPROXIMATE_SIZE_MB = 105;

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
		? m.downloads_sound_progress({ done: progress?.done ?? 0, total: progress?.total ?? 0 })
		: isComplete
			? m.downloads_sound_again()
			: m.downloads_sound_start({ size: APPROXIMATE_SIZE_MB })}
</Button>

<p>
	{#if isComplete}
		{m.downloads_sound_ready()}
	{:else}
		{m.downloads_sound_missing({ cached: cachedCount ?? 0, total: totalCount })}
	{/if}
</p>

{#if failedCount}
	<p>{m.downloads_sound_failed({ count: failedCount })}</p>
{/if}
