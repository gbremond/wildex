<script lang="ts">
	import { getSpeciesList, loadSpeciesInMemory } from '$lib/species/data/repository';
	import type { Species } from '$lib/species/model/model';
	import { onMount } from 'svelte';
	import { speciesImageUrl } from '$lib/species/data/image';
	import { Button } from '$lib/components/ui/button';

	let species = $state<Species[]>([]);

	onMount(async () => {
		await loadSpeciesInMemory();
		species = await getSpeciesList();
	});

	let fourRandomSpecies = $derived(pickRandom(species, 4));
	let answer = $derived(fourRandomSpecies[0]);
	let imageUrl = $derived(speciesImageUrl(answer.scientificName, 'medium'));
	let score = $state(0);
	let attempts = $state(0);

	function pickRandom(items: Species[], count: number) {
		const pool = [...items];
		const picks = Math.min(count, pool.length);

		for (let i = 0; i < picks; i++) {
			const pick = i + Math.floor(Math.random() * (pool.length - i));
			[pool[i], pool[pick]] = [pool[pick], pool[i]];
		}

		return pool.slice(0, picks);
	}

	function onClick(choice: Species) {
		if (choice.id === answer.id) {
			alert('Correct!');
			score += 1;
		} else {
			alert(`Wrong! The correct answer was ${answer.frenchName}.`);
		}
		attempts += 1;
		fourRandomSpecies = pickRandom(species, 4);
	}
</script>

<div class="mx-auto max-w-[480px] p-4 pb-(--bottom-nav-clearance)">
	<h1 class="text-3xl">Games</h1>

	<p>Score : {score} / {attempts} attempts</p>
	{#if answer}
		<img
			src={imageUrl}
			alt={answer.scientificName}
			class="mb-4 aspect-[3/2] w-full rounded object-cover"
		/>
	{/if}
	<div class="grid grid-cols-2 gap-4">
		{#each fourRandomSpecies as choice (choice.id)}
			<Button variant="outline" onclick={() => onClick(choice)}>{choice.frenchName}</Button>
		{/each}
	</div>
</div>
