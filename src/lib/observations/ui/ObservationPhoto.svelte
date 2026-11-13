<script lang="ts">
	import Feather from '@lucide/svelte/icons/feather';
	import { cn } from '$lib/utils';
	import SpeciesAvatar from '$lib/species/ui/SpeciesAvatar.svelte';
	import { speciesAvatarGradient } from '$lib/species/ui/avatar-gradient';
	import type { SpeciesImageSize } from '$lib/species/data/image';
	import { photoOf, type Observation } from '../model/observation';

	let {
		observation,
		size = 'thumb',
		class: className
	}: { observation: Observation; size?: SpeciesImageSize; class?: string } = $props();

	let photo = $derived(photoOf(observation));
	let captureUrl = $derived(photo.kind === 'capture' ? URL.createObjectURL(photo.blob) : null);

	$effect(() => {
		const url = captureUrl;
		return () => {
			if (url) URL.revokeObjectURL(url);
		};
	});
</script>

{#if captureUrl}
	<img
		src={captureUrl}
		alt={observation.species.name}
		class={cn('overflow-hidden rounded-xl object-cover', className)}
	/>
{:else if photo.kind === 'species'}
	<SpeciesAvatar
		seed={observation.species.speciesId ?? photo.scientificName}
		scientificName={photo.scientificName}
		fade={false}
		{size}
		class={cn('rounded-xl', className)}
	/>
{:else}
	<div
		class={cn('flex items-center justify-center rounded-xl text-white/90', className)}
		style="background-image: {speciesAvatarGradient(observation.species.name)}"
	>
		<Feather aria-hidden="true" class="size-4" />
	</div>
{/if}
