<script lang="ts">
	import { journal } from '../data/journal.svelte';
	import { newestFirst } from '../model/trip';
	import { m } from '$lib/paraglide/messages';
	import { getLocale } from '$lib/paraglide/runtime';

	/** A trip id, or '' for no trip: a select only holds strings. */
	let { value = $bindable() }: { value: string } = $props();

	let trips = $derived(newestFirst(journal.trips));

	const dayFormat = new Intl.DateTimeFormat(getLocale(), { dateStyle: 'medium' });
</script>

{#if trips.length}
	<div class="flex flex-col gap-1.5">
		<label for="observation-trip" class="text-sm font-medium">{m.trip_select_label()}</label>
		<select
			id="observation-trip"
			bind:value
			class="h-9 w-full rounded-3xl border-transparent bg-input/50 px-3 text-base outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 md:text-sm"
		>
			<option value="">{m.trip_select_none()}</option>
			{#each trips as trip (trip.id)}
				<option value={trip.id}>{trip.name} · {dayFormat.format(new Date(trip.startedAt))}</option>
			{/each}
		</select>
	</div>
{/if}
