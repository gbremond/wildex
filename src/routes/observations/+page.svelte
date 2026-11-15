<script lang="ts">
	import PageTitle from '$lib/components/PageTitle.svelte';
	import { onMount, type Component } from 'svelte';
	import { afterNavigate, goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { cn } from '$lib/utils';
	import XIcon from '@lucide/svelte/icons/x';
	import ListIcon from '@lucide/svelte/icons/list';
	import MapIcon from '@lucide/svelte/icons/map';
	import { journal } from '$lib/observations/data/journal.svelte';
	import {
		filterObservations,
		observedName,
		type ObservationFilter
	} from '$lib/observations/model/observation';
	import { getLocale } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages';
	import { readObservationFilter, toObservationsPath } from '$lib/observations/model/filter-url';
	import TripBar from '$lib/observations/ui/TripBar.svelte';
	import ObservationTimeline from '$lib/observations/ui/ObservationTimeline.svelte';
	import ObservationMap from '$lib/observations/ui/ObservationMap.svelte';

	type View = 'Timeline' | 'Map';

	const VIEWS: { name: View; label: () => string; icon: Component }[] = [
		{ name: 'Timeline', label: m.observations_view_timeline, icon: ListIcon },
		{ name: 'Map', label: m.observations_view_map, icon: MapIcon }
	];

	let view = $state<View>('Timeline');
	let filter = $state<ObservationFilter>({});

	let visibleObservations = $derived(filterObservations(journal.observations, filter));
	let filteredSpecies = $derived(
		journal.observations.find(({ species }) => species.speciesId === filter.speciesId)?.species
	);

	onMount(() => journal.load());

	// `location`, not `page.url`: this page is prerendered, where query strings do not exist.
	afterNavigate(() => {
		filter = readObservationFilter(new URLSearchParams(location.search));
	});

	function toggleTrip(tripId: string) {
		const next = filter.tripId === tripId ? undefined : tripId;
		goto(resolve(toObservationsPath({ ...filter, tripId: next })), {
			replaceState: true,
			noScroll: true
		});
	}
</script>

<div class="mx-auto flex max-w-120 flex-col gap-4 px-4 pt-6 pb-(--bottom-nav-clearance)">
	<PageTitle>{m.observations_title()}</PageTitle>

	<TripBar selectedTripId={filter.tripId} onSelect={toggleTrip} />

	{#if filter.speciesId}
		<a
			href={resolve(toObservationsPath({ tripId: filter.tripId }))}
			class="flex h-8 w-fit items-center gap-1.5 rounded-full bg-primary pr-2 pl-3 text-sm text-primary-foreground"
		>
			{filteredSpecies
				? observedName(filteredSpecies, getLocale())
				: m.observations_species_filter_fallback()}
			<XIcon aria-hidden="true" class="size-4" />
			<span class="sr-only">{m.observations_species_filter_clear()}</span>
		</a>
	{/if}

	<div
		role="group"
		aria-label={m.observations_view_label()}
		class="grid grid-cols-2 gap-1 rounded-full bg-muted p-1"
	>
		{#each VIEWS as { name, label, icon: Icon } (name)}
			<button
				type="button"
				aria-pressed={view === name}
				onclick={() => (view = name)}
				class={cn(
					'flex h-9 items-center justify-center gap-1.5 rounded-full text-sm text-muted-foreground transition-colors',
					view === name && 'bg-card font-medium text-foreground shadow-sm'
				)}
			>
				<Icon aria-hidden="true" class="size-4" />
				{label()}
			</button>
		{/each}
	</div>

	{#if view === 'Timeline'}
		<ObservationTimeline observations={visibleObservations} />
	{:else}
		<ObservationMap observations={visibleObservations} />
	{/if}
</div>
