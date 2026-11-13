<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { cn } from '$lib/utils';
	import MapPinnedIcon from '@lucide/svelte/icons/map-pinned';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import MapPinIcon from '@lucide/svelte/icons/map-pin';
	import type { Position } from '$lib/geolocation';
	import { journal } from '../data/journal.svelte';
	import { localDay } from '$lib/local-date';
	import { newTrip, tripChips } from '../model/trip';
	import AllTripsSheet from './AllTripsSheet.svelte';
	import PlacePicker from './PlacePicker.svelte';
	import { m } from '$lib/paraglide/messages';
	import { getLocale } from '$lib/paraglide/runtime';

	const RECENT_TRIP_COUNT = 3;

	let {
		selectedTripId,
		onSelect
	}: { selectedTripId?: string; onSelect: (tripId: string) => void } = $props();

	let naming = $state(false);
	let browsingAllTrips = $state(false);
	let name = $state('');
	let day = $state('');
	let placing = $state(false);
	let position = $state.raw<Position>();

	let chips = $derived(tripChips(journal.trips, selectedTripId, RECENT_TRIP_COUNT));

	const dayFormat = new Intl.DateTimeFormat(getLocale(), { day: 'numeric', month: 'short' });

	function openForm() {
		name = '';
		day = localDay(new Date());
		placing = false;
		position = undefined;
		naming = true;
	}

	async function save(event: SubmitEvent) {
		event.preventDefault();
		await journal.addTrip(newTrip(name.trim(), day, new Date(), position));
		naming = false;
	}

	function chipClass(isSelected: boolean) {
		return cn(
			'flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-sm transition-colors',
			isSelected ? 'border-primary bg-primary text-primary-foreground' : 'bg-card hover:bg-muted'
		);
	}
</script>

{#if naming}
	<form class="flex flex-col gap-4 rounded-2xl border bg-card p-4" onsubmit={save}>
		<div class="flex flex-col gap-1.5">
			<label for="trip-name" class="text-sm font-medium">{m.trip_form_name()}</label>
			<Input id="trip-name" bind:value={name} placeholder="Réserve ornithologique du Teich" />
		</div>
		<div class="flex flex-col gap-1.5">
			<label for="trip-day" class="text-sm font-medium">{m.trip_form_day()}</label>
			<Input id="trip-day" type="date" bind:value={day} />
			<p class="text-xs text-muted-foreground">
				{m.trip_form_day_hint()}
			</p>
		</div>
		<div class="flex flex-col gap-1.5">
			<span class="text-sm font-medium">{m.trip_form_place()}</span>
			{#if placing}
				<PlacePicker bind:position />
				<Button
					variant="ghost"
					size="sm"
					class="self-start"
					onclick={() => {
						placing = false;
						position = undefined;
					}}
				>
					{m.trip_form_remove_place()}
				</Button>
			{:else}
				<Button
					variant="outline"
					class="rounded-xl border-dashed bg-transparent text-muted-foreground"
					onclick={() => (placing = true)}
				>
					<MapPinIcon data-icon="inline-start" />
					{m.trip_form_add_place()}
				</Button>
			{/if}
		</div>
		<div class="flex justify-end gap-2">
			<Button variant="ghost" onclick={() => (naming = false)}>{m.trip_form_cancel()}</Button>
			<Button type="submit" disabled={!name.trim() || !day}>{m.trip_form_save()}</Button>
		</div>
	</form>
{:else}
	{#if journal.activeTrip}
		<div class="flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-3">
			<MapPinnedIcon aria-hidden="true" class="size-5 shrink-0 text-primary" />
			<p class="min-w-0 flex-1">
				<span class="block text-xs text-muted-foreground">{m.trip_active_label()}</span>
				<span class="line-clamp-2 font-medium">{journal.activeTrip.name}</span>
			</p>
			<Button variant="outline" size="sm" onclick={() => journal.endTrip()}>
				{m.trip_active_end()}
			</Button>
		</div>
	{/if}

	<div
		role="group"
		aria-label={m.trip_chips_label()}
		class="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1"
	>
		<button type="button" onclick={openForm} class={chipClass(false)}>
			<PlusIcon aria-hidden="true" class="size-4" />
			{m.trip_chips_new()}
		</button>
		{#each chips as trip (trip.id)}
			<button
				type="button"
				aria-pressed={selectedTripId === trip.id}
				onclick={() => onSelect(trip.id)}
				class={chipClass(selectedTripId === trip.id)}
			>
				{trip.name}
				<span class="opacity-70">· {dayFormat.format(new Date(trip.startedAt))}</span>
			</button>
		{/each}
		{#if journal.trips.length > RECENT_TRIP_COUNT}
			<button type="button" onclick={() => (browsingAllTrips = true)} class={chipClass(false)}>
				{m.trip_chips_all({ count: journal.trips.length })}
				<ChevronRightIcon aria-hidden="true" class="size-4" />
			</button>
		{/if}
	</div>

	<AllTripsSheet bind:open={browsingAllTrips} {selectedTripId} {onSelect} />
{/if}
