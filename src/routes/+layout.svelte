<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';

	let { children } = $props();

	let isOffline = $state(false);

	function updateNetworkStatus() {
		isOffline = !navigator.onLine;
	}

	onMount(updateNetworkStatus);
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<svelte:window ononline={updateNetworkStatus} onoffline={updateNetworkStatus} />

{@render children()}

{#if isOffline}
	<p role="status" class="mt-4 rounded bg-amber-100 px-3 py-2 text-sm text-amber-900">
		You are offline, showing species saved on this device.
	</p>
{/if}
