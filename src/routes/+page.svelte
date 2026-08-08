<script lang="ts">
	import { onMount } from 'svelte';
	import { downloadBirds } from '$lib/species/species.api';
	import type { Species } from '$lib/species/species.model';
	import {
		addSpecies,
		countAvailableSpecies,
		loadSpeciesInMemory,
		searchSpecies
	} from '$lib/species/species.repository';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
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

		const found = await searchSpecies(searchedQuery);

		if (searchId !== latestSearch) return;

		visibleSpecies = found;
		isSearching = false;
	}

	async function refreshStoredSpecies() {
		storedCount = await countAvailableSpecies();
		await runSearch(query);
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

{#if storedCount}
	<Input
		type="search"
		placeholder="Search a bird"
		bind:value={query}
		oninput={rememberQueryInUrl}
	/>

	{#if visibleSpecies.length > 0}
		<ul class="list-disc pl-5">
			{#each visibleSpecies as species (species.id)}
				<li>
					<a href={resolve('/species/[id]', { id: species.id })}>
						{species.frenchName} - <em>{species.scientificName}</em>
					</a>
				</li>
			{/each}
		</ul>
	{:else if !isSearching}
		<p>No bird matches “{query}”</p>
	{/if}
{/if}
