<script lang="ts">
	import { onMount, type Component } from 'svelte';
	import { afterNavigate, goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { cn } from '$lib/utils';
	import XIcon from '@lucide/svelte/icons/x';
	import ListIcon from '@lucide/svelte/icons/list';
	import MapIcon from '@lucide/svelte/icons/map';
	import { journal } from '$lib/observations/data/journal.svelte';
	import { filterObservations, type ObservationFilter } from '$lib/observations/model/observation';
	import { readObservationFilter, toObservationsPath } from '$lib/observations/model/filter-url';
	import TripBar from '$lib/observations/ui/TripBar.svelte';
	import ObservationTimeline from '$lib/observations/ui/ObservationTimeline.svelte';
	import ObservationMap from '$lib/observations/ui/ObservationMap.svelte';

	type View = 'Timeline' | 'Map';

	const VIEWS: { name: View; icon: Component }[] = [
		{ name: 'Timeline', icon: ListIcon },
		{ name: 'Map', icon: MapIcon }
	];

	let view = $state<View>('Timeline');
	let filter = $state<ObservationFilter>({});

	let visibleObservations = $derived(filterObservations(journal.observations, filter));
	let filteredSpeciesName = $derived(
		journal.observations.find(({ species }) => species.speciesId === filter.speciesId)?.species.name
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
	<h1 class="text-3xl">Observations</h1>

	<TripBar selectedTripId={filter.tripId} onSelect={toggleTrip} />

	{#if filter.speciesId}
		<a
			href={resolve(toObservationsPath({ tripId: filter.tripId }))}
			class="flex h-8 w-fit items-center gap-1.5 rounded-full bg-primary pr-2 pl-3 text-sm text-primary-foreground"
		>
			{filteredSpeciesName ?? 'This species'}
			<XIcon aria-hidden="true" class="size-4" />
			<span class="sr-only">Show every species</span>
		</a>
	{/if}

	<div role="group" aria-label="View" class="grid grid-cols-2 gap-1 rounded-full bg-muted p-1">
		{#each VIEWS as { name, icon: Icon } (name)}
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
				{name}
			</button>
		{/each}
	</div>

	{#if view === 'Timeline'}
		<ObservationTimeline observations={visibleObservations} />
	{:else}
		<ObservationMap observations={visibleObservations} />
	{/if}
</div>
