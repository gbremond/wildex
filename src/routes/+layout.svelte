<script lang="ts">
	import './layout.css';
	import interLatin from '@fontsource-variable/inter/files/inter-latin-wght-normal.woff2?url';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import { onNavigate } from '$app/navigation';
	import { version } from '$app/environment';
	import PwaUpdatePrompt from '$lib/components/PWAUpdatePrompt.svelte';

	let { children } = $props();

	let isOffline = $state(false);

	function updateNetworkStatus() {
		isOffline = !navigator.onLine;
	}

	onMount(updateNetworkStatus);

	onNavigate((navigation) => {
		if (!document.startViewTransition) return;

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
			You are offline, showing species saved on this device.
		</p>
	{/if}

	<div class="mt-6 text-xs text-muted-foreground">
		Wildex | Version {version}
	</div>

	<ul class="mt-2 space-y-0.5 text-[10px] text-muted-foreground">
		<li>TAXREF 2026. Référentiel taxonomique pour la France. UMS PatriNat (OFB-CNRS-MNHN), Paris. &lt;inpn.mnhn.fr&gt;</li>
		<li>IUCN 2026. IUCN Red List of Threatened Species. Version 2026-1 &lt;www.iucnredlist.org&gt;</li>
		<li>Xeno-canto Foundation 2026. Xeno-canto: bird sounds from around the world. &lt;xeno-canto.org&gt;</li>
		<li>Lepage D. 2026. Avibase: the world bird database. Bird Studies Canada. &lt;avibase.bsc-eoc.org&gt;</li>
		<li>Wikipedia contributors 2026. Wikipedia, the free encyclopedia. CC BY-SA 4.0. &lt;wikipedia.org&gt;</li>
	</ul>
</footer>
