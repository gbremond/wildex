<script lang="ts">
	import { getLocale } from '$lib/paraglide/runtime';
	import { otherLanguageName } from '../model/names';
	import type { Species } from '../model/model';
	import { habitatLabel, statusLabel } from './labels';
	import { m } from '$lib/paraglide/messages';
	import IucnBadge from './IucnBadge.svelte';

	let { species }: { species: Species } = $props();
</script>

<dl class="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
	<dt class="text-muted-foreground">{m.species_facts_other_language_name()}</dt>
	<dd>{otherLanguageName(species, getLocale())}</dd>

	<dt class="text-muted-foreground">{m.species_order()}</dt>
	<dd>{species.order}</dd>

	<dt class="text-muted-foreground">{m.species_facts_family()}</dt>
	<dd>{species.family}</dd>

	<dt class="text-muted-foreground">{m.species_habitat()}</dt>
	<dd>{habitatLabel(species.habitat)}</dd>

	<dt class="text-muted-foreground">{m.species_facts_iucn_status()}</dt>
	<dd><IucnBadge category={species.iucnCategory} /></dd>

	<dt class="text-muted-foreground">{m.species_status()}</dt>
	<dd>{statusLabel(species.status)}</dd>
</dl>
