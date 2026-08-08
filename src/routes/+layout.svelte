<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import { version } from '$app/environment';
	import PwaUpdatePrompt from '$lib/components/PWAUpdatePrompt.svelte';

	let { children } = $props();

	let isOffline = $state(false);

	function updateNetworkStatus() {
		isOffline = !navigator.onLine;
	}

	onMount(updateNetworkStatus);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>
<svelte:window ononline={updateNetworkStatus} onoffline={updateNetworkStatus} />

<main role="main">
	{@render children()}
</main>

<footer role="contentinfo">
	<PwaUpdatePrompt />

	{#if isOffline}
		<p role="status" class="mt-4 rounded bg-primary px-3 py-2 text-sm text-primary-foreground">
			You are offline, showing species saved on this device.
		</p>
	{/if}

	<div class="mt-6 text-xs text-muted-foreground">
		Wildex | Version {version}
	</div>
</footer>
