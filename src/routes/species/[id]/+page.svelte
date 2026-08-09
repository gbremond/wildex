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
	import ExternalLink from '$lib/components/ExternalLink.svelte';
	import { Button } from '$lib/components/ui/button';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import type { PageProps } from './$types';

	let { params }: PageProps = $props();

	let species = $state<Species | undefined>(undefined);
	let isLoading = $state(true);
	let canGoBack = $state(false);

	let referenceUrl = $derived(species ? avibaseUrl(species) : null);

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
		<SpeciesHero {species} />

		<SpeciesFacts {species} />

		{#if species.description}
			<p class="mt-4 text-sm">{species.description}</p>
		{/if}

		{#if referenceUrl}
			<ExternalLink href={referenceUrl} class="mt-6 inline-block">See on Avibase ↗</ExternalLink>
		{/if}

		<ExternalLink href={xenoCantoUrl(species)} class="mt-2 block">
			Listen on Xeno-canto ↗
		</ExternalLink>
	{:else}
		<p class="mt-4">This species is not on this device. Download the list first.</p>
	{/if}
</div>
