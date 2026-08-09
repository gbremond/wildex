<script lang="ts">
	import { readableLabel, type Species, type Status } from './species.model';
	import SpeciesAvatar from './SpeciesAvatar.svelte';
	import { Badge, type BadgeVariant } from '$lib/components/ui/badge';
	import { Item, ItemContent, ItemTitle, ItemDescription, ItemActions } from '$lib/components/ui/item';
	import { resolve } from '$app/paths';
	import { markSpeciesTransition } from './species-transition.svelte';

	let { species }: { species: Species } = $props();

	function statusBadgeVariant(status: Status): BadgeVariant {
		if (status === 'INVASIVE') return 'destructive';
		if (status === 'INTRODUCED' || status === 'OCCASIONAL') return 'warning';

		return 'success';
	}
</script>

<Item variant="outline" class="gap-0 overflow-hidden p-0 flex-nowrap">
	{#snippet child({ props })}
		<a
			{...props}
			href={resolve('/species/[id]', { id: species.id })}
			onclick={() => markSpeciesTransition(species.id)}
		>
			<SpeciesAvatar
				seed={species.id}
				scientificName={species.scientificName}
				class="w-24 shrink-0 self-stretch"
			/>
			<div class="flex flex-1 items-center gap-3.5 px-4 py-3.5">
				<ItemContent>
					<ItemTitle class="w-full truncate">{species.frenchName}</ItemTitle>
					<ItemDescription class="line-clamp-1"><em>{species.scientificName}</em></ItemDescription>
				</ItemContent>
				<ItemActions>
					<Badge variant={statusBadgeVariant(species.status)}>
						{readableLabel(species.status)}
					</Badge>
				</ItemActions>
			</div>
		</a>
	{/snippet}
</Item>
