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
	import LocateIcon from '@lucide/svelte/icons/locate';
	import { rankByLikelihood } from '$lib/birdnet/model/likely';
	import { findLikelySpeciesHere, type LikelySpeciesHere } from '$lib/birdnet/data/likely-here';

	let storedCount = $state<number | null>(null);
	let visibleSpecies = $state<Species[]>([]);
	let orders = $state<string[]>([]);
	let isSearching = $state(false);
	let query = $state('');
	let filters = $state<SpeciesFilters>({ ...NO_FILTERS });
	let aroundMe = $state(false);
	let likelySpeciesHere = $state<LikelySpeciesHere>();

	let likelihoods = $derived(
		aroundMe && likelySpeciesHere?.kind === 'found' ? likelySpeciesHere.likelihoods : undefined
	);
	let listedSpecies = $derived(
		likelihoods ? rankByLikelihood(visibleSpecies, likelihoods) : visibleSpecies
	);

	// Looked up once per visit: the position and the week barely move while browsing.
	$effect(() => {
		if (aroundMe && likelySpeciesHere === undefined) lookUpLikelySpecies();
	});

	async function lookUpLikelySpecies() {
		try {
			likelySpeciesHere = await findLikelySpeciesHere();
		} catch (cause) {
			console.error('Could not find the species likely here', cause);
			likelySpeciesHere = { kind: 'unavailable' };
		}
	}

	function toggleAroundMe() {
		aroundMe = !aroundMe;
		rememberSearchInUrl();
	}

	// `location`, not `page.url`: shallow routing writes the search to the history entry
	// without adopting it as the page URL, so only the browser knows it.
	afterNavigate(() => {
		({ query, filters, aroundMe } = readSearchParams(new URLSearchParams(location.search)));
	});

	function rememberSearchInUrl() {
		replaceState(resolve(toSearchPath(query, filters, aroundMe)), {});
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

{#snippet aroundMeStatus()}
	<p class="px-2 py-1 text-sm text-muted-foreground">
		{#if likelySpeciesHere === undefined}
			Finding the birds likely around you…
		{:else if likelySpeciesHere.kind === 'not-downloaded'}
			Around me needs sound detection — get it from the
			<a href={resolve('/downloads')} class="underline">Downloads page</a>.
		{:else if likelySpeciesHere.kind === 'no-position'}
			Your position is not available, so the list is not narrowed.
		{:else if likelySpeciesHere.kind === 'unavailable'}
			Around me is unavailable right now, so the list is not narrowed.
		{:else}
			Birds expected here this week, most likely first.
		{/if}
	</p>
{/snippet}

<div class="flex h-dvh flex-col">
	<h1 class="text-3xl">Welcome to Wildex</h1>

	{#if storedCount}
		<SpeciesSearchField bind:query onchange={rememberSearchInUrl} />

		<SpeciesFilterPanel bind:filters {orders} onchange={rememberSearchInUrl}>
			{#snippet leading()}
				<Button
					variant={aroundMe ? 'default' : 'ghost'}
					size="sm"
					class={aroundMe ? '' : 'text-muted-foreground'}
					aria-pressed={aroundMe}
					onclick={toggleAroundMe}
				>
					<LocateIcon />
					Around me
				</Button>
			{/snippet}
		</SpeciesFilterPanel>

		{#if aroundMe}
			{@render aroundMeStatus()}
		{/if}

		<SpeciesList
			species={listedSpecies}
			{isSearching}
			{query}
			hasFilters={aroundMe || countSelectedFilters(filters) > 0}
			{likelihoods}
		/>
	{/if}
</div>
