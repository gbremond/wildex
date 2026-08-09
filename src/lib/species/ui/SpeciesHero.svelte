<script lang="ts">
	import type { Species } from '../model/model';
	import { speciesImageUrl } from '../data/image';
	import { speciesPhotoTransitionName } from './transition.svelte';

	let { species }: { species: Species } = $props();

	let imageUrl = $derived(speciesImageUrl(species.scientificName, 'medium'));
	let imageFailed = $state(false);
</script>

{#if imageFailed}
	<h1 class="mt-4 text-3xl">{species.frenchName}</h1>
	<p class="text-muted-foreground italic">{species.scientificName}</p>
{:else}
	<div class="relative" style="view-transition-name: {speciesPhotoTransitionName(species.id)}">
		<img
			src={imageUrl}
			alt={species.scientificName}
			class="aspect-[3/2] w-full object-cover"
			onerror={() => (imageFailed = true)}
		/>
		<div
			class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 pt-16 pb-4"
		>
			<h1 class="text-3xl text-white">{species.frenchName}</h1>
			<p class="text-white/85 italic">{species.scientificName}</p>
		</div>
	</div>
{/if}
