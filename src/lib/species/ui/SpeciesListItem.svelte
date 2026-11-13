<script lang="ts">
	import { getLocale } from '$lib/paraglide/runtime';
	import { speciesName } from '../model/names';
	import type { Species } from '../model/model';
	import { statusBadgeVariant } from './badge-variants';
	import { statusLabel } from './labels';
	import SpeciesAvatar from './SpeciesAvatar.svelte';
	import IucnBadge from './IucnBadge.svelte';
	import { Badge } from '$lib/components/ui/badge';
	import {
		Item,
		ItemContent,
		ItemTitle,
		ItemDescription,
		ItemActions
	} from '$lib/components/ui/item';
	import { resolve } from '$app/paths';
	import { markSpeciesTransition } from './transition.svelte';

	let { species, likelihood }: { species: Species; likelihood?: number } = $props();

	const percentFormat = new Intl.NumberFormat(getLocale(), { style: 'percent' });
</script>

<Item variant="outline" class="flex-nowrap gap-0 overflow-hidden bg-card p-0">
	{#snippet child({ props })}
		<a
			{...props}
			href={resolve('/species/[id]', { id: species.id })}
			onclick={() => markSpeciesTransition(species.id)}
		>
			<SpeciesAvatar
				seed={species.id}
				scientificName={species.scientificName}
				class="w-20 shrink-0 self-stretch"
			/>
			<div class="flex min-w-0 flex-1 items-center gap-3.5 px-4 py-3.5">
				<ItemContent class="min-w-0">
					<ItemTitle class="block w-full truncate">{speciesName(species, getLocale())}</ItemTitle>
					<ItemDescription class="line-clamp-1"><em>{species.scientificName}</em></ItemDescription>
				</ItemContent>
				<ItemActions class="flex-col items-end gap-1">
					{#if likelihood !== undefined}
						<span class="text-sm font-medium text-primary tabular-nums">
							{percentFormat.format(likelihood)}
						</span>
					{/if}
					{#if species.iucnCategory !== 'LEAST_CONCERN' && species.iucnCategory !== 'UNKNOWN'}
						<IucnBadge category={species.iucnCategory} />
					{/if}
					<Badge variant={statusBadgeVariant(species.status)}>
						{statusLabel(species.status)}
					</Badge>
				</ItemActions>
			</div>
		</a>
	{/snippet}
</Item>
