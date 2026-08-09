<script lang="ts">
	import type { IucnCategory } from '../model/model';
	import { iucnBadgeVariant, iucnIcon } from './badge-variants';
	import { readableLabel } from './labels';
	import { Badge } from '$lib/components/ui/badge';

	let { category }: { category: IucnCategory } = $props();

	let Icon = $derived(iucnIcon(category));
</script>

<Badge variant={iucnBadgeVariant(category)}>
	<Icon data-icon="inline-start" />
	{readableLabel(category)}
</Badge>
