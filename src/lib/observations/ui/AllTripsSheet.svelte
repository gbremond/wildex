<script lang="ts">
	import * as Drawer from '$lib/components/ui/drawer';
	import BottomSheetContent from '$lib/components/BottomSheetContent.svelte';
	import * as InputGroup from '$lib/components/ui/input-group';
	import { cn } from '$lib/utils';
	import SearchIcon from '@lucide/svelte/icons/search';
	import { journal } from '../data/journal.svelte';
	import { groupByYear, searchTrips } from '../model/trip';
	import { m } from '$lib/paraglide/messages';
	import { getLocale } from '$lib/paraglide/runtime';

	let {
		open = $bindable(false),
		selectedTripId,
		onSelect
	}: { open?: boolean; selectedTripId?: string; onSelect: (tripId: string) => void } = $props();

	let query = $state('');

	let years = $derived(groupByYear(searchTrips(journal.trips, query)));
	let observationsPerTrip = $derived(
		Map.groupBy(journal.observations, (observation) => observation.tripId)
	);

	const dayFormat = new Intl.DateTimeFormat(getLocale(), { day: 'numeric', month: 'short' });

	function choose(tripId: string) {
		onSelect(tripId);
		open = false;
	}
</script>

<Drawer.Root bind:open onOpenChange={(isOpen) => isOpen && (query = '')}>
	<BottomSheetContent>
		<Drawer.Header>
			<Drawer.Title>{m.trip_all_title()}</Drawer.Title>
		</Drawer.Header>

		<div class="px-4 pb-2">
			<InputGroup.Root>
				<InputGroup.Addon>
					<SearchIcon />
				</InputGroup.Addon>
				<InputGroup.Input
					bind:value={query}
					placeholder={m.trip_all_search()}
					aria-label={m.trip_all_search()}
				/>
			</InputGroup.Root>
		</div>

		<div data-vaul-no-drag class="max-h-[60vh] overflow-y-auto px-4 pb-6">
			{#each years as { year, trips } (year)}
				<h3 class="mt-4 mb-1 text-xs font-medium text-muted-foreground">{year}</h3>
				<ul class="divide-y overflow-hidden rounded-2xl border">
					{#each trips as trip (trip.id)}
						{@const count = observationsPerTrip.get(trip.id)?.length ?? 0}
						<li>
							<button
								type="button"
								aria-pressed={selectedTripId === trip.id}
								onclick={() => choose(trip.id)}
								class={cn(
									'flex w-full flex-col px-3 py-2.5 text-left hover:bg-muted/50',
									selectedTripId === trip.id && 'bg-primary/5'
								)}
							>
								<span class="font-medium">{trip.name}</span>
								<span class="text-sm text-muted-foreground">
									{dayFormat.format(new Date(trip.startedAt))} ·
									{m.trip_all_observation_count({ count })}
								</span>
							</button>
						</li>
					{/each}
				</ul>
			{:else}
				<p class="py-6 text-center text-sm text-muted-foreground">
					{m.trip_all_no_match({ query })}
				</p>
			{/each}
		</div>
	</BottomSheetContent>
</Drawer.Root>
