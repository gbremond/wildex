<script lang="ts">
	import * as InputGroup from '$lib/components/ui/input-group';
	import SearchIcon from '@lucide/svelte/icons/search';
	import XIcon from '@lucide/svelte/icons/x';

	let { query = $bindable(), onchange }: { query: string; onchange: () => void } = $props();

	function clearQuery() {
		query = '';
		onchange();
	}
</script>

<div class="relative my-4 w-full">
	<InputGroup.Root class="w-full">
		<InputGroup.Addon>
			<SearchIcon />
		</InputGroup.Addon>
		<InputGroup.Input
			placeholder="Search a bird"
			class={query ? 'pr-9' : ''}
			bind:value={query}
			oninput={onchange}
		/>
	</InputGroup.Root>
	{#if query}
		<!--
			A real, plain <button> as a sibling here (not nested inside InputGroup.Root
			alongside the input) — on Chrome's mobile viewport, a <button> directly next
			to the focused search <input> aborts any in-flight View Transition when a
			result link is clicked afterwards. Positioned absolutely to keep the same
			look as before.
		-->
		<InputGroup.Button
			onclick={clearQuery}
			size="icon-sm"
			aria-label="Clear search"
			class="absolute top-1/2 right-2 -translate-y-1/2"
		>
			<XIcon />
		</InputGroup.Button>
	{/if}
</div>
