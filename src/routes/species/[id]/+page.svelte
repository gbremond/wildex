<script lang="ts">
	import { onMount } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { Species } from '$lib/species/model/model';
	import { avibaseUrl, xenoCantoUrl } from '$lib/species/data/links';
	import { findSpeciesById, loadSpeciesInMemory } from '$lib/species/data/repository';
	import { markSpeciesTransition } from '$lib/species/ui/transition.svelte';
	import SpeciesHero from '$lib/species/ui/SpeciesHero.svelte';
	import SpeciesFacts from '$lib/species/ui/SpeciesFacts.svelte';
	import { speciesDescription } from '$lib/species/model/names';
	import { getLocale } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages';
	import ExternalLink from '$lib/components/ExternalLink.svelte';
	import { Button } from '$lib/components/ui/button';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import BinocularsIcon from '@lucide/svelte/icons/binoculars';
	import ObservationSheet from '$lib/observations/ui/ObservationSheet.svelte';
	import ObservationRow from '$lib/observations/ui/ObservationRow.svelte';
	import ObservationDetails, {
		type OpenedObservation
	} from '$lib/observations/ui/ObservationDetails.svelte';
	import { journal } from '$lib/observations/data/journal.svelte';
	import { filterObservations } from '$lib/observations/model/observation';
	import { toObservationsPath } from '$lib/observations/model/filter-url';
	import type { PageProps } from './$types';

	const LATEST_OBSERVATION_COUNT = 3;

	let { params }: PageProps = $props();

	let species = $state<Species | undefined>(undefined);
	let isLoading = $state(true);
	let canGoBack = $state(false);

	let referenceUrl = $derived(species ? avibaseUrl(species) : null);
	let description = $derived(species && speciesDescription(species, getLocale()));
	let observations = $derived(filterObservations(journal.observations, { speciesId: params.id }));
	let opened = $state<OpenedObservation | null>(null);

	const observedAtFormat = new Intl.DateTimeFormat(getLocale(), {
		dateStyle: 'medium',
		timeStyle: 'short'
	});

	$effect(() => {
		if (species) markSpeciesTransition(species.id);
	});

	afterNavigate(({ from }) => {
		canGoBack = from !== null;
	});

	function returnToSearch(event: MouseEvent) {
		if (!canGoBack) return;

		event.preventDefault();
		history.back();
	}

	onMount(async () => {
		await Promise.all([loadSpeciesInMemory(), journal.load()]);
		species = await findSpeciesById(params.id);
		isLoading = false;
	});
</script>

<div class="bg-primary">
	<div class="mx-auto max-w-120 p-2">
		<Button
			href={resolve('/')}
			onclick={returnToSearch}
			variant="link"
			class="-ml-3 text-primary-foreground hover:text-primary-foreground"
		>
			<ArrowLeftIcon data-icon="inline-start" />
			{m.species_page_back()}
		</Button>
	</div>
</div>

<div class="mx-auto max-w-120 pb-(--bottom-nav-clearance)">
	{#if isLoading}
		<p class="p-4">{m.loading()}</p>
	{:else if species}
		<SpeciesHero {species} />

		<div class="flex flex-col gap-6 px-4 pt-4">
			<SpeciesFacts {species} />

			<ObservationSheet presetSpecies={species}>
				{#snippet trigger(props)}
					<Button {...props} size="lg" class="w-full">
						<BinocularsIcon data-icon="inline-start" />
						{m.species_page_seen_it()}
					</Button>
				{/snippet}
			</ObservationSheet>

			{#if observations.length}
				<section class="flex flex-col gap-3">
					<div class="flex items-baseline justify-between">
						<h2 class="text-lg font-medium">
							{m.species_page_seen_count({ count: observations.length })}
						</h2>
						<a
							href={resolve(toObservationsPath({ speciesId: species.id }))}
							class="text-sm font-medium text-primary underline-offset-4 hover:underline"
						>
							{m.species_page_see_all()}
						</a>
					</div>
					<ul class="flex flex-col gap-3">
						{#each observations.slice(0, LATEST_OBSERVATION_COUNT) as observation (observation.id)}
							{@const context = journal.tripName(observation.tripId) ?? observation.notes}
							<li>
								<ObservationRow {observation} onOpen={(mode) => (opened = { observation, mode })}>
									<span class="block font-medium">
										{observedAtFormat.format(new Date(observation.observedAt))}
									</span>
									{#if context}
										<span class="block truncate text-muted-foreground">{context}</span>
									{/if}
								</ObservationRow>
							</li>
						{/each}
					</ul>
				</section>
			{/if}

			{#if description}
				<p class="text-sm leading-relaxed">{description}</p>
			{/if}

			<div class="flex flex-col gap-2">
				{#if referenceUrl}
					<ExternalLink href={referenceUrl}>{m.species_page_avibase()}</ExternalLink>
				{/if}
				<ExternalLink href={xenoCantoUrl(species)}>{m.species_page_xeno_canto()}</ExternalLink>
			</div>
		</div>
	{:else}
		<p class="p-4">{m.species_page_not_found()}</p>
	{/if}
</div>

<ObservationDetails bind:opened />
