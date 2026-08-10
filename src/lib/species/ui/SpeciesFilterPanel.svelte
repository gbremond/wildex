<script lang="ts">
	import * as Collapsible from '$lib/components/ui/collapsible';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import SlidersHorizontalIcon from '@lucide/svelte/icons/sliders-horizontal';
	import XIcon from '@lucide/svelte/icons/x';
	import { NO_FILTERS, countSelectedFilters, type SpeciesFilters } from '../model/filters';
	import {
		HABITAT_OPTIONS,
		IUCN_OPTIONS,
		STATUS_OPTIONS,
		toOrderOptions,
		type FacetOption
	} from './facet-options';
	import { statusBadgeVariant } from './badge-variants';
	import type { IucnCategory, Status } from '../model/model';
	import IucnBadge from './IucnBadge.svelte';
	import SpeciesFacetFilter from './SpeciesFacetFilter.svelte';

	let {
		filters = $bindable(),
		orders,
		onchange
	}: { filters: SpeciesFilters; orders: string[]; onchange: () => void } = $props();

	let isOpen = $state(false);

	const selectedCount = $derived(countSelectedFilters(filters));
	const orderOptions = $derived(toOrderOptions(orders));

	function clearAll() {
		filters = { ...NO_FILTERS };
		onchange();
	}
</script>

{#snippet statusOptionBadge(option: FacetOption<Status>)}
	<Badge variant={statusBadgeVariant(option.value)}>{option.label}</Badge>
{/snippet}

{#snippet iucnOptionBadge(option: FacetOption<IucnCategory>)}
	<IucnBadge category={option.value} />
{/snippet}

<Collapsible.Root bind:open={isOpen}>
	<div class="flex items-center gap-1">
		<Collapsible.Trigger>
			{#snippet child({ props })}
				<Button {...props} variant="ghost" size="sm" class="text-muted-foreground">
					<SlidersHorizontalIcon />
					Filters
					{#if selectedCount > 0}
						<Badge variant="secondary">{selectedCount}</Badge>
					{/if}
					<ChevronDownIcon class="transition-transform duration-200 {isOpen ? 'rotate-180' : ''}" />
				</Button>
			{/snippet}
		</Collapsible.Trigger>

		{#if selectedCount > 0}
			<Button variant="ghost" size="sm" class="text-muted-foreground" onclick={clearAll}>
				<XIcon />
				Clear all
			</Button>
		{/if}
	</div>

	<Collapsible.Content
		class="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down"
	>
		<div class="flex flex-wrap gap-2 pt-2 pb-1">
			<SpeciesFacetFilter
				label="Status"
				options={STATUS_OPTIONS}
				bind:selected={filters.status}
				{onchange}
				optionBadge={statusOptionBadge}
			/>
			<SpeciesFacetFilter
				label="Order"
				options={orderOptions}
				bind:selected={filters.order}
				{onchange}
			/>
			<SpeciesFacetFilter
				label="Habitat"
				options={HABITAT_OPTIONS}
				bind:selected={filters.habitat}
				{onchange}
			/>
			<SpeciesFacetFilter
				label="IUCN"
				options={IUCN_OPTIONS}
				bind:selected={filters.iucn}
				{onchange}
				optionBadge={iucnOptionBadge}
			/>
		</div>
	</Collapsible.Content>
</Collapsible.Root>
