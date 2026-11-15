<script lang="ts">
	import { getLocale } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages';
	import { Badge } from '$lib/components/ui/badge';
	import BinocularsIcon from '@lucide/svelte/icons/binoculars';
	import { localDay } from '$lib/local-date';
	import { journal } from '../data/journal.svelte';
	import { groupByDay, observedName, type Observation } from '../model/observation';
	import ObservationDetails, { type OpenedObservation } from './ObservationDetails.svelte';
	import ObservationRow from './ObservationRow.svelte';
	import { ARRIVE_CLASS, hasJustArrived } from './arrival.svelte';

	let { observations }: { observations: Observation[] } = $props();

	let days = $derived(groupByDay(observations));
	let opened = $state<OpenedObservation | null>(null);

	const dayFormat = new Intl.DateTimeFormat(getLocale(), {
		weekday: 'long',
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	});
	const timeFormat = new Intl.DateTimeFormat(getLocale(), { hour: '2-digit', minute: '2-digit' });

	function dayTitle(day: string): string {
		const today = new Date();
		const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);

		if (day === localDay(today)) return m.timeline_today();
		if (day === localDay(yesterday)) return m.timeline_yesterday();
		return dayFormat.format(new Date(`${day}T12:00`));
	}
</script>

{#if !journal.loaded}
	<p class="sr-only">{m.timeline_loading()}</p>
{:else if days.length === 0}
	<div class="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
		<BinocularsIcon aria-hidden="true" class="size-8" />
		<p>{m.timeline_empty()}</p>
		<p class="text-sm">{m.timeline_empty_hint()}</p>
	</div>
{:else}
	<ol class="flex flex-col gap-6">
		{#each days as { day, observations: ofTheDay } (day)}
			<!-- A day made only of new observations is new itself, title included. -->
			<li class={{ [ARRIVE_CLASS]: ofTheDay.every(hasJustArrived) }}>
				<h2 class="text-sm font-medium text-muted-foreground first-letter:uppercase">
					{dayTitle(day)}
				</h2>
				<ul class="mt-2 flex flex-col gap-3 border-l-2 border-muted pl-3">
					{#each ofTheDay as observation (observation.id)}
						{@const tripName = journal.tripName(observation.tripId)}
						<li class={{ [ARRIVE_CLASS]: hasJustArrived(observation) }}>
							<ObservationRow {observation} onOpen={(mode) => (opened = { observation, mode })}>
								<span class="flex items-baseline gap-2">
									<span class="truncate text-base font-medium"
										>{observedName(observation.species, getLocale())}</span
									>
									{#if !observation.species.speciesId}
										<Badge variant="outline">{m.timeline_unlisted()}</Badge>
									{/if}
								</span>
								<span class="block truncate text-muted-foreground">
									{timeFormat.format(new Date(observation.observedAt))}
									{#if tripName}· {tripName}{/if}
									{#if observation.notes}· {observation.notes}{/if}
								</span>
							</ObservationRow>
						</li>
					{/each}
				</ul>
			</li>
		{/each}
	</ol>
{/if}

<ObservationDetails bind:opened />
