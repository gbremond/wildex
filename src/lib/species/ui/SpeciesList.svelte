<script lang="ts">
	import type { Species } from '../model/model';
	import SpeciesListItem from './SpeciesListItem.svelte';
	import SvelteVirtualList from '@humanspeak/svelte-virtual-list';
	import { fade } from 'svelte/transition';
	import { cn } from '$lib/utils';

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
		{#snippet renderItem(item, index)}
			<!-- The last card carries the room to scroll clear of the bottom nav bar. -->
			<div
				class={cn('px-2', index === species.length - 1 ? 'pb-(--bottom-nav-clearance)' : 'pb-2')}
				in:fade={{ duration: 120 }}
			>
				<SpeciesListItem species={item} />
			</div>
		{/snippet}
	</SvelteVirtualList>
{:else if !isSearching}
	<p>{emptyMessage}</p>
{/if}
