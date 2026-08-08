<script lang="ts">
	import { onMount } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { avibaseUrl, readableLabel, type Species } from '$lib/species/species.model';
	import { findSpeciesById, loadSpeciesInMemory } from '$lib/species/species.repository';
	import type { PageProps } from './$types';

	let { params }: PageProps = $props();

	let species = $state<Species | undefined>(undefined);
	let isLoading = $state(true);
	let canGoBack = $state(false);

	let referenceUrl = $derived(species ? avibaseUrl(species) : null);

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

<a
	href={resolve('/')}
	onclick={returnToSearch}
	class="text-sm text-muted-foreground hover:underline"
>
	← Back to search
</a>

{#if isLoading}
	<p>Loading…</p>
{:else if species}
	<h1 class="mt-4 text-3xl">{species.frenchName}</h1>
	<p class="text-muted-foreground italic">{species.scientificName}</p>

	<dl class="mt-6 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
		<dt class="text-muted-foreground">English name</dt>
		<dd>{species.englishName}</dd>

		<dt class="text-muted-foreground">Order</dt>
		<dd>{species.order}</dd>

		<dt class="text-muted-foreground">Family</dt>
		<dd>{species.family}</dd>

		<dt class="text-muted-foreground">Habitat</dt>
		<dd>{readableLabel(species.habitat)}</dd>

		<dt class="text-muted-foreground">Status</dt>
		<dd>{readableLabel(species.status)}</dd>
	</dl>

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
{:else}
	<p class="mt-4">This species is not on this device. Download the list first.</p>
{/if}
