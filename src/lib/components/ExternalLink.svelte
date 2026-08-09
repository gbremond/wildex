<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils';

	let {
		href,
		class: className,
		children
	}: { href: string; class?: string; children: Snippet } = $props();
</script>

<a
	{href}
	target="_blank"
	rel="external noreferrer"
	class={cn('text-sm hover:underline', className)}
>
	{@render children()}
</a>
