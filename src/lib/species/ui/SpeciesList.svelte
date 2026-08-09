<script lang="ts">
	import type { Species } from '../model/model';
	import SpeciesListItem from './SpeciesListItem.svelte';
	import SvelteVirtualList from '@humanspeak/svelte-virtual-list';
	import { fade } from 'svelte/transition';

	let { species, isSearching, query }: { species: Species[]; isSearching: boolean; query: string } =
		$props();
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
	<p>No bird matches “{query}”</p>
{/if}
