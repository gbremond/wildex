<script lang="ts">
	import { Drawer as DrawerPrimitive } from 'vaul-svelte';
	import { cn } from '$lib/utils.js';

	let { class: className, ...restProps }: DrawerPrimitive.HandleProps = $props();
</script>

<DrawerPrimitive.Handle
	data-slot="drawer-handle"
	class={cn('mx-auto h-1.5 w-24 shrink-0 rounded-full bg-muted', className)}
	{...restProps}
/>
