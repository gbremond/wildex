<script lang="ts">
	import { readableLabel, type Species, type Status } from './species.model';
	import SpeciesAvatar from './SpeciesAvatar.svelte';
	import { Badge, type BadgeVariant } from '$lib/components/ui/badge';
	import {
		Item,
		ItemMedia,
		ItemContent,
		ItemTitle,
		ItemDescription,
		ItemActions
	} from '$lib/components/ui/item';
	import { resolve } from '$app/paths';

	let { species }: { species: Species } = $props();

	function statusBadgeVariant(status: Status): BadgeVariant {
		if (status === 'INVASIVE') return 'destructive';
		if (status === 'INTRODUCED' || status === 'OCCASIONAL') return 'warning';

		return 'success';
	}
</script>

<Item variant="outline">
	{#snippet child({ props })}
		<a {...props} href={resolve('/species/[id]', { id: species.id })}>
			<ItemMedia>
				<SpeciesAvatar seed={species.id} />
			</ItemMedia>
			<ItemContent>
				<ItemTitle>{species.frenchName}</ItemTitle>
				<ItemDescription><em>{species.scientificName}</em></ItemDescription>
			</ItemContent>
			<ItemActions>
				<Badge variant={statusBadgeVariant(species.status)}>
					{readableLabel(species.status)}
				</Badge>
			</ItemActions>
		</a>
	{/snippet}
</Item>
