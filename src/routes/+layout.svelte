<script lang="ts">
	import './layout.css';
	import interLatin from '@fontsource-variable/inter/files/inter-latin-wght-normal.woff2?url';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import { onNavigate } from '$app/navigation';
	import { prefersReducedMotion } from 'svelte/motion';
	import PwaUpdatePrompt from '$lib/components/PWAUpdatePrompt.svelte';
	import BottomNavBar from '$lib/components/BottomNavBar.svelte';
	import { getLocale } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages';

	let { children } = $props();

	let isOffline = $state(false);

	function updateNetworkStatus() {
		isOffline = !navigator.onLine;
	}

	onMount(() => {
		updateNetworkStatus();
		// Pages are prerendered in French; the reader's choice is only known in the browser.
		document.documentElement.lang = getLocale();
	});

	onNavigate((navigation) => {
		if (!document.startViewTransition || prefersReducedMotion.current) return;

		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

<svelte:head>
	<link rel="preload" href={interLatin} as="font" type="font/woff2" crossorigin="anonymous" />
	<link rel="icon" href={favicon} />
</svelte:head>
<svelte:window ononline={updateNetworkStatus} onoffline={updateNetworkStatus} />

<main>
	{@render children()}
</main>

<footer>
	<PwaUpdatePrompt />

	{#if isOffline}
		<p role="status" class="mt-4 rounded bg-primary px-3 py-2 text-sm text-primary-foreground">
			{m.offline_notice()}
		</p>
	{/if}
</footer>

<BottomNavBar />
