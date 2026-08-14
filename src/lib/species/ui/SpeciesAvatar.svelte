<script lang="ts">
	import Feather from '@lucide/svelte/icons/feather';
	import { cn } from '$lib/utils';
	import { speciesAvatarGradient } from './avatar-gradient';
	import { speciesImageUrl } from '../data/image';
	import { isSpeciesTransitioning, speciesPhotoTransitionName } from './transition.svelte';

	let {
		seed,
		scientificName,
		fade = true,
		class: className
	}: { seed: string; scientificName: string; fade?: boolean; class?: string } = $props();

	let imageUrl = $derived(speciesImageUrl(scientificName, 'thumb'));
	let imageFailed = $state(false);
	let transitionStyle = $derived(
		isSpeciesTransitioning(seed) ? `view-transition-name: ${speciesPhotoTransitionName(seed)}` : ''
	);
</script>

<div class={cn('relative overflow-hidden rounded-l-2xl', className)} style={transitionStyle}>
	{#if !imageFailed}
		<img
			src={imageUrl}
			alt={scientificName}
			class="size-full object-cover"
			onerror={() => (imageFailed = true)}
		/>
		{#if fade}
			<!-- Bleeds the photo into the card it sits in; wrong on a standalone thumbnail. -->
			<div
				class="absolute inset-y-0 right-0 w-6 bg-gradient-to-r from-background/0 to-background"
			></div>
		{/if}
	{:else}
		<div
			class="flex size-full items-center justify-center text-white/90"
			style="background-image: {speciesAvatarGradient(seed)}"
		>
			<Feather class="size-4" />
		</div>
	{/if}
</div>
