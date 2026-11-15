<script lang="ts">
	import type { Snippet } from 'svelte';
	import LanguageSwitch from './LanguageSwitch.svelte';

	let { children }: { children: Snippet } = $props();
</script>

<div class="flex items-center justify-between gap-4">
	<h1 class="text-3xl">{@render children()}</h1>
	<LanguageSwitch />
</div>
