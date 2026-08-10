<script lang="ts">
	import type { Species } from '../model/model';
	import { readableLabel } from './labels';
	import IucnBadge from './IucnBadge.svelte';

	let { species }: { species: Species } = $props();
</script>

<dl class="mt-6 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
	<dt class="text-muted-foreground">English name</dt>
	<dd>{species.englishName}</dd>

	<dt class="text-muted-foreground">Order</dt>
	<dd>{species.order}</dd>

	<dt class="text-muted-foreground">Family</dt>
	<dd>{species.family}</dd>

	<dt class="text-muted-foreground">Habitat</dt>
	<dd>{readableLabel(species.habitat)}</dd>

	<dt class="text-muted-foreground">IUCN status</dt>
	<dd><IucnBadge category={species.iucnCategory} /></dd>

	<dt class="text-muted-foreground">Status</dt>
	<dd>{readableLabel(species.status)}</dd>
</dl>
