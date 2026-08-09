<script lang="ts">
	import { onMount } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { avibaseUrl, readableLabel, xenoCantoUrl, type Species } from '$lib/species/species.model';
	import { findSpeciesById, loadSpeciesInMemory } from '$lib/species/species.repository';
	import { speciesImageUrl, speciesPhotoTransitionName } from '$lib/species/species-image';
	import { markSpeciesTransition } from '$lib/species/species-transition.svelte';
	import { iucnBadgeVariant, iucnIcon } from '$lib/species/species-badge';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import type { PageProps } from './$types';

	let { params }: PageProps = $props();

	let species = $state<Species | undefined>(undefined);
	let isLoading = $state(true);
	let canGoBack = $state(false);
	let heroImageFailed = $state(false);

	let referenceUrl = $derived(species ? avibaseUrl(species) : null);
	let soundUrl = $derived(species ? xenoCantoUrl(species) : null);
	let heroImageUrl = $derived(species ? speciesImageUrl(species.scientificName, 'medium') : null);

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
		await loadSpeciesInMemory();
		species = await findSpeciesById(params.id);
		isLoading = false;
	});
</script>

<div class="bg-primary">
	<div class="mx-auto max-w-[480px] p-2">
		<Button
			href={resolve('/')}
			onclick={returnToSearch}
			variant="link"
			class="-ml-3 text-primary-foreground hover:text-primary-foreground"
		>
			<ArrowLeftIcon data-icon="inline-start" />
			Back to search
		</Button>
	</div>
</div>

<div class="mx-auto max-w-[480px]">
	{#if isLoading}
		<p>Loading…</p>
	{:else if species}
		{#if heroImageUrl && !heroImageFailed}
			<div
				class="relative"
				style="view-transition-name: {speciesPhotoTransitionName(species.id)}"
			>
				<img
					src={heroImageUrl}
					alt={species.scientificName}
					class="aspect-[3/2] w-full object-cover"
					onerror={() => (heroImageFailed = true)}
				/>
				<div
					class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 pt-16 pb-4"
				>
					<h1 class="text-3xl text-white">{species.frenchName}</h1>
					<p class="italic text-white/85">{species.scientificName}</p>
				</div>
			</div>
		{:else}
			<h1 class="mt-4 text-3xl">{species.frenchName}</h1>
			<p class="text-muted-foreground italic">{species.scientificName}</p>
		{/if}

		<dl class="mt-6 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
			<dt class="text-muted-foreground">English name</dt>
			<dd>{species.englishName}</dd>

			<dt class="text-muted-foreground">Order</dt>
			<dd>{species.order}</dd>

			<dt class="text-muted-foreground">Family</dt>
			<dd>{species.family}</dd>

			<dt class="text-muted-foreground">Habitat</dt>
			<dd>{readableLabel(species.habitat)}</dd>

			{#if species.iucnCategory}
				{@const IucnIcon = iucnIcon(species.iucnCategory)}
				<dt class="text-muted-foreground">IUCN status</dt>
				<dd>
					<Badge variant={iucnBadgeVariant(species.iucnCategory)}>
						<IucnIcon data-icon="inline-start" />
						{readableLabel(species.iucnCategory)}
					</Badge>
				</dd>
			{/if}

			<dt class="text-muted-foreground">Status</dt>
			<dd>{readableLabel(species.status)}</dd>
		</dl>

		{#if species.description}
			<p class="mt-4 text-sm">{species.description}</p>
		{/if}

		{#if referenceUrl}
			<a
				href={referenceUrl}
				target="_blank"
				rel="external noreferrer"
				class="mt-6 inline-block text-sm hover:underline"
			>
				See on Avibase ↗
			</a>
		{/if}

		{#if soundUrl}
			<a
				href={soundUrl}
				target="_blank"
				rel="external noreferrer"
				class="mt-2 block text-sm hover:underline"
			>
				Listen on Xeno-canto ↗
			</a>
		{/if}
	{:else}
		<p class="mt-4">This species is not on this device. Download the list first.</p>
	{/if}
</div>
