<script lang="ts">
	import type { ObservedSpecies } from '../model/observation';
	import { m } from '$lib/paraglide/messages';
	import { getLocale } from '$lib/paraglide/runtime';

	let { heard }: { heard: { species: ObservedSpecies; score: number }[] } = $props();

	const percentFormat = new Intl.NumberFormat(getLocale(), { style: 'percent' });
</script>

<div class="flex flex-col gap-1.5">
	<span class="text-sm font-medium">{m.heard_species_count({ count: heard.length })}</span>
	<ul class="flex flex-col gap-1 rounded-2xl border p-2">
		{#each heard as { species, score } (species.name)}
			<li class="flex items-baseline justify-between gap-2 text-sm">
				<span>
					{species.name}
					<span class="text-muted-foreground italic">{species.scientificName}</span>
				</span>
				<span class="shrink-0 tabular-nums">{percentFormat.format(score)}</span>
			</li>
		{/each}
	</ul>
	<p class="text-xs text-muted-foreground">
		{m.heard_species_saved_separately({ count: heard.length })}
	</p>
</div>
