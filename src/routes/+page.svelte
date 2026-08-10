<script lang="ts">
	import { onMount } from 'svelte';
	import type { Species } from '$lib/species/model/model';
	import {
		countAvailableSpecies,
		getSpeciesList,
		loadSpeciesInMemory,
		searchStoredSpecies
	} from '$lib/species/data/repository';
	import SpeciesSearchField from '$lib/species/ui/SpeciesSearchField.svelte';
	import SpeciesFilterPanel from '$lib/species/ui/SpeciesFilterPanel.svelte';
	import SpeciesList from '$lib/species/ui/SpeciesList.svelte';
	import {
		NO_FILTERS,
		countSelectedFilters,
		distinctOrders,
		type SpeciesFilters
	} from '$lib/species/model/filters';
	import { readSearchParams, toSearchPath } from '$lib/species/model/search-url';
	import { afterNavigate, replaceState } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { Button } from '$lib/components/ui/button';

	let storedCount = $state<number | null>(null);
	let visibleSpecies = $state<Species[]>([]);
	let orders = $state<string[]>([]);
	let isSearching = $state(false);
	let query = $state('');
	let filters = $state<SpeciesFilters>({ ...NO_FILTERS });

	// `location`, not `page.url`: shallow routing writes the search to the history entry
	// without adopting it as the page URL, so only the browser knows it.
	afterNavigate(() => {
		({ query, filters } = readSearchParams(new URLSearchParams(location.search)));
	});

	function rememberSearchInUrl() {
		replaceState(resolve(toSearchPath(query, filters)), {});
	}

	// Bumped by every search so a slow answer cannot overwrite a newer one.
	let latestSearch = 0;

	// Snapshotting reads every facet now: what a `$effect` reads after an `await`
	// is no longer tracked.
	$effect(() => {
		runSearch(query, $state.snapshot(filters));
	});

	onMount(async () => {
		await loadSpeciesInMemory();
		await refreshStoredSpecies();
	});

	async function runSearch(searchedQuery: string, searchedFilters: SpeciesFilters) {
		const searchId = ++latestSearch;

		isSearching = true;

		const found = await searchStoredSpecies(searchedQuery, searchedFilters);

		if (searchId !== latestSearch) return;

		visibleSpecies = found;
		isSearching = false;
	}

	async function refreshStoredSpecies() {
		storedCount = await countAvailableSpecies();
		orders = distinctOrders(await getSpeciesList());
		await runSearch(query, $state.snapshot(filters));
	}
</script>

<div class="flex h-dvh flex-col">
	<h1 class="text-3xl">Welcome to Wildex</h1>

	<Button
		href={resolve('/downloads')}
		variant="link"
	>
		Download page
	</Button>

	{#if storedCount}
		<SpeciesSearchField bind:query onchange={rememberSearchInUrl} />

		<SpeciesFilterPanel bind:filters {orders} onchange={rememberSearchInUrl} />

		<SpeciesList
			species={visibleSpecies}
			{isSearching}
			{query}
			hasFilters={countSelectedFilters(filters) > 0}
		/>
	{/if}
</div>
