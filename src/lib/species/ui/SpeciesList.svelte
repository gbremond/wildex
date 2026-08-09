<script lang="ts">
	import type { Species } from '../model/model';
	import SpeciesListItem from './SpeciesListItem.svelte';
	import SvelteVirtualList from '@humanspeak/svelte-virtual-list';
	import { fade } from 'svelte/transition';

	let {
		species,
		isSearching,
		query,
		hasFilters
	}: { species: Species[]; isSearching: boolean; query: string; hasFilters: boolean } = $props();

	const emptyMessage = $derived.by(() => {
		if (query && hasFilters) return `No bird matches “${query}” with these filters`;
		if (query) return `No bird matches “${query}”`;

		return 'No bird matches these filters';
	});
</script>

{#if species.length > 0}
	<SvelteVirtualList items={species} defaultEstimatedItemHeight={88}>
		{#snippet renderItem(item)}
			<div class="px-2 pb-2" in:fade={{ duration: 120 }}>
				<SpeciesListItem species={item} />
			</div>
		{/snippet}
	</SvelteVirtualList>
{:else if !isSearching}
	<p>{emptyMessage}</p>
{/if}
