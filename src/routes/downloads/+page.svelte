<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		addSpecies,
		countAvailableSpecies,
		loadSpeciesInMemory
	} from '$lib/species/data/repository';
	import { downloadSpecies } from '$lib/species/data/api';
	import ImageDownloadPanel from '$lib/species/ui/ImageDownloadPanel.svelte';
	import { onMount } from 'svelte';
	import { version } from '$app/environment';

	let storedCount = $state<number | null>(null);
	let isDownloading = $state(false);

	onMount(async () => {
		await loadSpeciesInMemory();
		storedCount = await countAvailableSpecies();
	});

	async function downloadAndStoreSpecies() {
		isDownloading = true;

		try {
			await addSpecies(await downloadSpecies());
			storedCount = await countAvailableSpecies();
		} finally {
			isDownloading = false;
		}
	}
</script>

<div class="mx-auto max-w-[480px] pb-(--bottom-nav-clearance)">
	<Button onclick={downloadAndStoreSpecies} disabled={isDownloading}>
		{isDownloading ? 'Downloading…' : 'Download species'}
	</Button>

	{#if storedCount !== null}
		<p>{storedCount} species stored offline</p>

		<ImageDownloadPanel />
	{/if}

	<div class="mt-6 text-xs text-muted-foreground">
		Wildex | Version {version}
	</div>

	<ul class="mt-2 space-y-0.5 text-[10px] text-muted-foreground">
		<li>
			TAXREF 2026. Référentiel taxonomique pour la France. UMS PatriNat (OFB-CNRS-MNHN), Paris.
			&lt;inpn.mnhn.fr&gt;
		</li>
		<li>
			IUCN 2026. IUCN Red List of Threatened Species. Version 2026-1 &lt;www.iucnredlist.org&gt;
		</li>
		<li>
			Xeno-canto Foundation 2026. Xeno-canto: bird sounds from around the world.
			&lt;xeno-canto.org&gt;
		</li>
		<li>
			Lepage D. 2026. Avibase: the world bird database. Bird Studies Canada.
			&lt;avibase.bsc-eoc.org&gt;
		</li>
		<li>
			Wikipedia contributors 2026. Wikipedia, the free encyclopedia. CC BY-SA 4.0.
			&lt;wikipedia.org&gt;
		</li>
	</ul>
</div>
