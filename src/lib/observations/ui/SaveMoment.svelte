<script lang="ts">
	import * as Drawer from '$lib/components/ui/drawer';
	import { Button } from '$lib/components/ui/button';
	import CheckIcon from '@lucide/svelte/icons/check';
	import { getLocale } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages';
	import { observedName, type Observation } from '../model/observation';
	import ObservationPhoto from './ObservationPhoto.svelte';

	let {
		saved,
		firstSightings,
		lifeListSize,
		onDone
	}: {
		saved: Observation[];
		firstSightings: Observation[];
		lifeListSize: number;
		onDone: () => void;
	} = $props();

	// A first sighting is the peak of the hobby: it outshines the rest of the batch.
	let isFirstSighting = $derived(firstSightings.length > 0);
	let shown = $derived(isFirstSighting ? firstSightings : saved);

	const names = new Intl.ListFormat(getLocale(), { type: 'conjunction' });
</script>

<div class="flex flex-col items-center gap-2 px-4 pt-8 pb-6">
	<div class="relative flex -space-x-6">
		{#each shown as observation, index (observation.id)}
			<div class="stamp relative rounded-full" style="--delay: {index * 120}ms">
				{#if isFirstSighting}
					<span aria-hidden="true" class="halo absolute inset-0 rounded-full border-2 border-primary"
					></span>
				{/if}
				<ObservationPhoto
					{observation}
					class="size-28 rounded-full border-4 border-card shadow-md"
				/>
			</div>
		{/each}
		{#if !isFirstSighting}
			<span
				aria-hidden="true"
				class="tick absolute right-0 bottom-0 flex size-9 items-center justify-center rounded-full border-4 border-card bg-primary text-primary-foreground"
			>
				<CheckIcon class="size-4" strokeWidth={3} />
			</span>
		{/if}
	</div>

	<Drawer.Header class="items-center pb-2 text-center">
		<p role="status" class="text-xs font-semibold tracking-widest text-primary uppercase">
			{isFirstSighting
				? m.save_moment_first({ count: firstSightings.length })
				: m.save_moment_saved({ count: saved.length })}
		</p>
		<Drawer.Title class="text-2xl">
			{names.format(shown.map(({ species }) => observedName(species, getLocale())))}
		</Drawer.Title>
		{#if isFirstSighting}
			<Drawer.Description>{m.save_moment_life_list({ count: lifeListSize })}</Drawer.Description>
		{/if}
	</Drawer.Header>

	{#if isFirstSighting}
		<Button size="lg" class="w-full" onclick={onDone}>{m.save_moment_done()}</Button>
	{/if}
</div>

<style>
	.stamp {
		animation: stamp 450ms cubic-bezier(0.34, 1.56, 0.64, 1) var(--delay) both;
	}

	.tick {
		animation: stamp 350ms cubic-bezier(0.34, 1.56, 0.64, 1) 250ms both;
	}

	/* Rings out once: a loop would keep the GPU busy for as long as the sheet is open. */
	.halo {
		opacity: 0;
		animation: halo 1.1s ease-out calc(var(--delay) + 250ms);
	}

	@keyframes stamp {
		from {
			opacity: 0;
			transform: scale(0.6);
		}
	}

	@keyframes halo {
		from {
			opacity: 0.6;
			transform: scale(1);
		}
		to {
			opacity: 0;
			transform: scale(1.45);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.stamp,
		.tick,
		.halo {
			animation: none;
		}
	}
</style>
