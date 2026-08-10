<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		addSpecies,
		countAvailableSpecies,
		loadSpeciesInMemory
	} from '$lib/species/data/repository';
	import { downloadSpecies } from '$lib/species/data/api';
	import ImageDownloadPanel from '$lib/species/ui/ImageDownloadPanel.svelte';
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';

	let storedCount = $state<number | null>(null);
	let isDownloading = $state(false);

	onMount(async () => {
		await loadSpeciesInMemory();
		storedCount = await countAvailableSpecies();
	});

	async function downloadAndStoreSpecies() {
		isDownloading = true;

		try {
			await addSpecies(await downloadSpecies());
			storedCount = await countAvailableSpecies();
		} finally {
			isDownloading = false;
		}
	}
</script>

<div class="bg-primary">
	<div class="mx-auto max-w-[480px] p-2">
		<Button
			href={resolve('/')}
			variant="link"
			class="-ml-3 text-primary-foreground hover:text-primary-foreground"
		>
			<ArrowLeftIcon data-icon="inline-start" />
			Back to search
		</Button>
	</div>
</div>

<Button onclick={downloadAndStoreSpecies} disabled={isDownloading}>
	{isDownloading ? 'Downloading…' : 'Download species'}
</Button>

{#if storedCount !== null}
	<p>{storedCount} species stored offline</p>

	<ImageDownloadPanel />
{/if}
