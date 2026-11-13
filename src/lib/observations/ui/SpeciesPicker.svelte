<script lang="ts">
	import { getLocale } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages';
	import { speciesName } from '$lib/species/model/names';
	import { onMount } from 'svelte';
	import { Input } from '$lib/components/ui/input';
	import type { Species } from '$lib/species/model/model';
	import { MIN_QUERY_LENGTH, searchSpecies } from '$lib/species/model/search';
	import { getSpeciesList, loadSpeciesInMemory } from '$lib/species/data/repository';
	import SpeciesAvatar from '$lib/species/ui/SpeciesAvatar.svelte';
	import { observedSpeciesFrom, type ObservedSpecies } from '../model/observation';

	const SUGGESTION_COUNT = 5;

	let { species = $bindable() }: { species: ObservedSpecies } = $props();

	let allSpecies = $state<Species[]>([]);

	let suggestions = $derived(
		species.speciesId || species.name.trim().length < MIN_QUERY_LENGTH
			? []
			: searchSpecies(allSpecies, species.name).slice(0, SUGGESTION_COUNT)
	);

	onMount(async () => {
		await loadSpeciesInMemory();
		allSpecies = await getSpeciesList();
	});

	// Typing turns the pick back into a free-text name: the species is unlisted
	// until a suggestion is chosen again.
	function rename(event: Event) {
		species = { name: (event.currentTarget as HTMLInputElement).value };
	}
</script>

<div class="flex flex-col gap-1.5">
	<label for="observation-species" class="text-sm font-medium">{m.species_picker_label()}</label>
	<Input
		id="observation-species"
		value={species.name}
		oninput={rename}
		placeholder={m.species_picker_placeholder()}
		autocomplete="off"
	/>

	{#if suggestions.length === 0 && species.name.trim() && !species.speciesId}
		<p class="text-xs text-muted-foreground">{m.species_picker_unlisted()}</p>
	{:else if suggestions.length}
		<ul class="flex flex-col gap-1">
			{#each suggestions as suggestion (suggestion.id)}
				<li>
					<button
						type="button"
						class="flex w-full items-center gap-3 rounded-xl p-1.5 text-left hover:bg-muted"
						onclick={() => (species = observedSpeciesFrom(suggestion))}
					>
						<SpeciesAvatar
							seed={suggestion.id}
							scientificName={suggestion.scientificName}
							fade={false}
							class="size-9 shrink-0 rounded-lg"
						/>
						<span class="min-w-0">
							<span class="block truncate text-sm">{speciesName(suggestion, getLocale())}</span>
							<span class="block truncate text-xs text-muted-foreground italic">
								{suggestion.scientificName}
							</span>
						</span>
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>
