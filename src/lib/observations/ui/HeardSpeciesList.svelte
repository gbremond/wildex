<script lang="ts">
	import type { ObservedSpecies } from '../model/observation';

	let { heard }: { heard: { species: ObservedSpecies; score: number }[] } = $props();
</script>

<div class="flex flex-col gap-1.5">
	<span class="text-sm font-medium">{heard.length} species heard</span>
	<ul class="flex flex-col gap-1 rounded-2xl border p-2">
		{#each heard as { species, score } (species.name)}
			<li class="flex items-baseline justify-between gap-2 text-sm">
				<span>
					{species.name}
					<span class="text-muted-foreground italic">{species.scientificName}</span>
				</span>
				<span class="shrink-0 tabular-nums">{Math.round(score * 100)}%</span>
			</li>
		{/each}
	</ul>
	<p class="text-xs text-muted-foreground">
		Saved as {heard.length} separate observations, each with its own recording.
	</p>
</div>
