<script lang="ts">
	import type { Species } from '../model/model';
	import SpeciesListItem from './SpeciesListItem.svelte';
	import SvelteVirtualList from '@humanspeak/svelte-virtual-list';
	import { cn } from '$lib/utils';
	import SearchXIcon from '@lucide/svelte/icons/search-x';
	import type { Likelihoods } from '$lib/birdnet/model/likely';
	import { m } from '$lib/paraglide/messages';

	let {
		species,
		isSearching,
		query,
		hasFilters,
		likelihoods
	}: {
		species: Species[];
		isSearching: boolean;
		query: string;
		hasFilters: boolean;
		likelihoods?: Likelihoods;
	} = $props();

	const emptyMessage = $derived.by(() => {
		if (query && hasFilters) return m.species_list_no_match_query_and_filters({ query });
		if (query) return m.species_list_no_match_query({ query });

		return m.species_list_no_match_filters();
	});

	const SETTLING_ROWS = 10;
	const SETTLE_STEP_MS = 30;

	// Only the first screen cascades; rows scrolled into view should appear at once.
	function settleDelay(index: number): string {
		return index < SETTLING_ROWS ? `${index * SETTLE_STEP_MS}ms` : '0ms';
	}
</script>

{#if species.length > 0}
	<!-- Full-bleed so the cards' focus rings are not clipped by the scroll area. -->
	<div class="-mx-4 min-h-0 flex-1">
		<SvelteVirtualList items={species} defaultEstimatedItemHeight={88}>
			{#snippet renderItem(item, index)}
				<!-- The last card carries the room to scroll clear of the bottom nav bar. -->
				<div
					class={cn('px-4', index === species.length - 1 ? 'pb-(--bottom-nav-clearance)' : 'pb-3')}
				>
					<!-- Rows are recycled by position: keying on the bird replays its entrance. -->
					{#key item.id}
						<div
							class="animate-in duration-300 fill-mode-backwards fade-in slide-in-from-bottom-2 motion-reduce:animate-none"
							style:animation-delay={settleDelay(index)}
						>
							<SpeciesListItem species={item} likelihood={likelihoods?.get(item.scientificName)} />
						</div>
					{/key}
				</div>
			{/snippet}
		</SvelteVirtualList>
	</div>
{:else if !isSearching}
	<div class="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
		<SearchXIcon aria-hidden="true" class="size-8" />
		<p>{emptyMessage}</p>
	</div>
{/if}
