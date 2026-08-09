<script lang="ts">
	import Feather from '@lucide/svelte/icons/feather';
	import { cn } from '$lib/utils';
	import { speciesAvatarGradient } from './species-avatar';
	import { speciesImageUrl, speciesPhotoTransitionName } from './species-image';
	import { isSpeciesTransitioning } from './species-transition.svelte';

	let {
		seed,
		scientificName,
		class: className
	}: { seed: string; scientificName: string; class?: string } = $props();

	let imageUrl = $derived(speciesImageUrl(scientificName, 'thumb'));
	let imageFailed = $state(false);
	let transitionStyle = $derived(
		isSpeciesTransitioning(seed) ? `view-transition-name: ${speciesPhotoTransitionName(seed)}` : ''
	);
</script>

<div
	class={cn('relative overflow-hidden rounded-l-2xl', className)}
	style={transitionStyle}
>
	{#if !imageFailed}
		<img
			src={imageUrl}
			alt={scientificName}
			class="size-full object-cover"
			onerror={() => (imageFailed = true)}
		/>
		<div class="absolute inset-y-0 right-0 w-6 bg-gradient-to-r from-background/0 to-background"></div>
	{:else}
		<div
			class="flex size-full items-center justify-center text-white/90"
			style="background-image: {speciesAvatarGradient(seed)}"
		>
			<Feather class="size-4" />
		</div>
	{/if}
</div>
