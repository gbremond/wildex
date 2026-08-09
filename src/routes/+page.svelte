<script lang="ts">
	import { onMount } from 'svelte';
	import { downloadSpecies } from '$lib/species/data/api';
	import type { Species } from '$lib/species/model/model';
	import {
		addSpecies,
		countAvailableSpecies,
		loadSpeciesInMemory,
		searchStoredSpecies
	} from '$lib/species/data/repository';
	import ImageDownloadPanel from '$lib/species/ui/ImageDownloadPanel.svelte';
	import SpeciesSearchField from '$lib/species/ui/SpeciesSearchField.svelte';
	import SpeciesList from '$lib/species/ui/SpeciesList.svelte';
	import { Button } from '$lib/components/ui/button';
	import { afterNavigate, replaceState } from '$app/navigation';
	import { resolve } from '$app/paths';

	let storedCount = $state<number | null>(null);
	let visibleSpecies = $state<Species[]>([]);
	let isDownloading = $state(false);
	let isSearching = $state(false);
	let query = $state('');

	// `location`, not `page.url`: shallow routing writes the query to the history entry
	// without adopting it as the page URL, so only the browser knows it.
	afterNavigate(() => {
		query = new URLSearchParams(location.search).get('q') ?? '';
	});

	function rememberQueryInUrl() {
		replaceState(resolve(query ? `/?q=${encodeURIComponent(query)}` : '/'), {});
	}

	// Bumped by every search so a slow answer cannot overwrite a newer one.
	let latestSearch = 0;

	$effect(() => {
		runSearch(query);
	});

	onMount(async () => {
		await loadSpeciesInMemory();
		await refreshStoredSpecies();
	});

	async function runSearch(searchedQuery: string) {
		const searchId = ++latestSearch;

		isSearching = true;

		const found = await searchStoredSpecies(searchedQuery);

		if (searchId !== latestSearch) return;

		visibleSpecies = found;
		isSearching = false;
	}

	async function refreshStoredSpecies() {
		storedCount = await countAvailableSpecies();
		await runSearch(query);
	}

	async function downloadAndStoreSpecies() {
		isDownloading = true;

		try {
			await addSpecies(await downloadSpecies());
			await refreshStoredSpecies();
		} finally {
			isDownloading = false;
		}
	}
</script>

<div class="flex h-dvh flex-col">
	<h1 class="text-3xl">Welcome to Wildex</h1>

	<Button onclick={downloadAndStoreSpecies} disabled={isDownloading}>
		{isDownloading ? 'Downloading…' : 'Download species'}
	</Button>

	{#if storedCount !== null}
		<p>{storedCount} species stored offline</p>
	{/if}

	{#if storedCount}
		<ImageDownloadPanel />

		<SpeciesSearchField bind:query onchange={rememberQueryInUrl} />

		<SpeciesList species={visibleSpecies} {isSearching} {query} />
	{/if}
</div>
