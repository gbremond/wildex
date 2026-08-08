<script lang="ts">
	import { onMount } from 'svelte';
	import { downloadBirds } from '$lib/species/species.api';
	import type { Species } from '$lib/species/species.model';
	import {
		addSpecies,
		countAvailableSpecies,
		getSpeciesList,
		loadSpeciesInMemory
	} from '$lib/species/species.repository';
	import { Button } from '$lib/components/ui/button';

	let storedCount = $state<number | null>(null);
	let storedSpecies = $state<Species[]>([]);
	let isDownloading = $state(false);

	onMount(async () => {
		await loadSpeciesInMemory();
		await refreshStoredSpecies();
	});

	async function refreshStoredSpecies() {
		storedCount = await countAvailableSpecies();
		storedSpecies = await getSpeciesList();
	}

	async function downloadSpecies() {
		isDownloading = true;

		try {
			await addSpecies(await downloadBirds());
			await refreshStoredSpecies();
		} finally {
			isDownloading = false;
		}
	}
</script>

<h1 class="text-3xl">Welcome to Wildex</h1>

<Button onclick={downloadSpecies} disabled={isDownloading}>
	{isDownloading ? 'Downloading…' : 'Download species'}
</Button>

{#if storedCount !== null}
	<p>{storedCount} species stored offline</p>
{/if}

{#if storedSpecies.length > 0}
	<ul class="list-disc pl-5">
		{#each storedSpecies as species (species.id)}
			<li>
				{species.commonName} — <em>{species.scientificName}</em>
			</li>
		{/each}
	</ul>
{/if}
