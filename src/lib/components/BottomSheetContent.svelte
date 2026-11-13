<script lang="ts">
	import type { Snippet } from 'svelte';
	import * as Drawer from '$lib/components/ui/drawer';

	let { children }: { children: Snippet } = $props();
</script>

<!-- Sits in the same column as the bottom nav bar, which it slides over. -->
<Drawer.Content
	class="mx-auto max-w-120 rounded-t-3xl border border-b-0 bg-card p-0 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_-4px_rgb(0_0_0/0.15)] before:hidden"
>
	{@render children()}
</Drawer.Content>
