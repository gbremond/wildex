<script lang="ts">
	import { getLocale } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages';
	import { speciesName } from '../model/names';
	import type { Species } from '../model/model';
	import type { GalleryPhoto } from '../model/gallery';
	import { speciesImageUrl } from '../data/image';
	import { fetchGalleryPhotos } from '../data/inaturalist';
	import { speciesPhotoTransitionStyle } from './transition.svelte';

	let { species }: { species: Species } = $props();

	let imageUrl = $derived(speciesImageUrl(species.scientificName, 'medium'));
	let imageFailed = $state(false);
	let gallery = $state.raw<GalleryPhoto[]>([]);
	let currentSlide = $state(0);
	// Each photo loads when the one before it is shown, so a swipe never waits on a blank slide.
	let loadedUpTo = $state(1);

	let firstGallerySlide = $derived(imageFailed ? 0 : 1);
	let slideCount = $derived(firstGallerySlide + gallery.length);

	// Asked for once the downloaded photo is settled, so it never competes with it.
	async function showGallery() {
		gallery = await fetchGalleryPhotos(species.scientificName);
	}

	function trackSlide(event: Event) {
		const { scrollLeft, clientWidth } = event.currentTarget as HTMLElement;
		currentSlide = Math.round(scrollLeft / clientWidth);
		loadedUpTo = Math.max(loadedUpTo, currentSlide + 1);
	}
</script>

{#if slideCount === 0}
	<h1 class="mt-4 text-3xl">{speciesName(species, getLocale())}</h1>
	<p class="text-muted-foreground italic">{species.scientificName}</p>
{:else}
	<div class="relative" style={speciesPhotoTransitionStyle(species.id)}>
		<div
			role="region"
			aria-label={m.species_gallery_label()}
			onscroll={trackSlide}
			class="flex aspect-[3/2] snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
		>
			{#if !imageFailed}
				<img
					src={imageUrl}
					alt={species.scientificName}
					class="size-full shrink-0 snap-start object-cover"
					onload={showGallery}
					onerror={() => {
						imageFailed = true;
						showGallery();
					}}
				/>
			{/if}
			{#each gallery as photo, index (photo.id)}
				<figure class="relative size-full shrink-0 snap-start bg-muted">
					{#if firstGallerySlide + index <= loadedUpTo}
						<img
							src={photo.url}
							srcset="{photo.url} 500w, {photo.largeUrl} 1024w"
							sizes="(max-width: 480px) 100vw, 480px"
							alt={species.scientificName}
							decoding="async"
							class="size-full object-cover"
						/>
					{/if}
					<figcaption
						class="absolute top-2 left-3 text-[10px] text-white/85 [text-shadow:0_1px_2px_rgb(0_0_0/0.8)]"
					>
						{photo.credit}
					</figcaption>
				</figure>
			{/each}
		</div>

		{#if slideCount > 1}
			<span
				aria-hidden="true"
				class="absolute top-2 right-3 rounded-full bg-black/45 px-2 py-0.5 text-xs text-white tabular-nums"
			>
				{currentSlide + 1} / {slideCount}
			</span>
		{/if}

		<div
			class="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 pt-16 pb-4"
		>
			<h1 class="text-3xl text-white">{speciesName(species, getLocale())}</h1>
			<p class="text-white/85 italic">{species.scientificName}</p>
		</div>
	</div>
{/if}
