<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import type { Observation } from '../model/observation';
	import type { DetailsMode } from './ObservationDetails.svelte';
	import ObservationPhoto from './ObservationPhoto.svelte';

	let {
		observation,
		onOpen,
		children
	}: {
		observation: Observation;
		onOpen: (mode: DetailsMode) => void;
		children: Snippet;
	} = $props();
</script>

<div class="flex items-center gap-1">
	<button
		type="button"
		onclick={() => onOpen('details')}
		class="flex min-w-0 flex-1 items-center gap-3 rounded-xl text-left"
	>
		<ObservationPhoto {observation} class="size-12 shrink-0" />
		<span class="min-w-0 flex-1 text-sm">
			{@render children()}
		</span>
	</button>
	<Button
		variant="ghost"
		size="icon-sm"
		class="shrink-0 text-muted-foreground"
		aria-label="Delete {observation.species.name}"
		onclick={() => onOpen('delete')}
	>
		<Trash2Icon />
	</Button>
</div>
