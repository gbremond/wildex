<script lang="ts">
    import {onMount} from 'svelte';
    import {downloadBirds} from '$lib/species/species.api';
    import type {Species} from '$lib/species/species.model';
    import {
        addSpecies,
        countAvailableSpecies,
        getSpeciesList,
        loadSpeciesInMemory,
        searchSpecies
    } from '$lib/species/species.repository';
    import {cacheSpeciesImages, countCachedImages} from '$lib/species/species-image-cache';
    import SpeciesListItem from '$lib/species/SpeciesListItem.svelte';
    import {Button} from '$lib/components/ui/button';
    import * as InputGroup from '$lib/components/ui/input-group';
    import SearchIcon from '@lucide/svelte/icons/search';
    import XIcon from '@lucide/svelte/icons/x';
    import {afterNavigate, replaceState} from '$app/navigation';
    import {resolve} from '$app/paths';
    import SvelteVirtualList from '@humanspeak/svelte-virtual-list';
    import {fade} from 'svelte/transition';

    let storedCount = $state<number | null>(null);
    let visibleSpecies = $state<Species[]>([]);
    let isDownloading = $state(false);
    let isSearching = $state(false);
    let query = $state('');

    let cachedImageCount = $state<number | null>(null);
    let isDownloadingImages = $state(false);
    let imageDownloadProgress = $state<{ done: number; total: number } | null>(null);

    // `location`, not `page.url`: shallow routing writes the query to the history entry
    // without adopting it as the page URL, so only the browser knows it.
    afterNavigate(() => {
        query = new URLSearchParams(location.search).get('q') ?? '';
    });

    function rememberQueryInUrl() {
        replaceState(resolve(query ? `/?q=${encodeURIComponent(query)}` : '/'), {});
    }

    function clearQuery() {
        query = '';
        rememberQueryInUrl();
    }

    // Bumped by every search so a slow answer cannot overwrite a newer one.
    let latestSearch = 0;

    $effect(() => {
        runSearch(query);
    });

    onMount(async () => {
        await loadSpeciesInMemory();
        await refreshStoredSpecies();
        await refreshCachedImageCount();
    });

    async function runSearch(searchedQuery: string) {
        const searchId = ++latestSearch;

        isSearching = true;

        const found = await searchSpecies(searchedQuery);

        if (searchId !== latestSearch) return;

        visibleSpecies = found;
        isSearching = false;
    }

    async function refreshStoredSpecies() {
        storedCount = await countAvailableSpecies();
        await runSearch(query);
    }

    async function downloadSpecies() {
        isDownloading = true;

        try {
            await addSpecies(await downloadBirds());
            await refreshStoredSpecies();
        } finally {
            isDownloading = false;
        }
    }

    async function refreshCachedImageCount() {
        cachedImageCount = await countCachedImages();
    }

    async function downloadImages() {
        isDownloadingImages = true;
        imageDownloadProgress = null;

        try {
            await cacheSpeciesImages(await getSpeciesList(), (done, total) => {
                imageDownloadProgress = {done, total};
            });
            await refreshCachedImageCount();
        } finally {
            isDownloadingImages = false;
        }
    }
</script>

<div class="flex h-dvh flex-col">
    <h1 class="text-3xl">Welcome to Wildex</h1>

    <Button onclick={downloadSpecies} disabled={isDownloading}>
        {isDownloading ? 'Downloading…' : 'Download species'}
    </Button>

    {#if storedCount !== null}
        <p>{storedCount} species stored offline</p>
    {/if}

    {#if storedCount}
        <Button onclick={downloadImages} disabled={isDownloadingImages}>
            {isDownloadingImages
                ? `Downloading images… ${imageDownloadProgress?.done ?? 0}/${imageDownloadProgress?.total ?? 0}`
                : 'Download images'}
        </Button>

        {#if cachedImageCount}
            <p>{cachedImageCount} images stored offline</p>
        {:else }
            <p>0 images stored offline</p>
        {/if}

        <InputGroup.Root class="my-4 w-full">
            <InputGroup.Addon>
                <SearchIcon/>
            </InputGroup.Addon>
            <InputGroup.Input
                    placeholder="Search a bird"
                    bind:value={query}
                    oninput={rememberQueryInUrl}
            />
            {#if query}
                <InputGroup.Addon align="inline-end">
                    <InputGroup.Button onclick={clearQuery} size="icon-sm" aria-label="Clear search">
                        <XIcon/>
                    </InputGroup.Button>
                </InputGroup.Addon>
            {/if}
        </InputGroup.Root>

        {#if visibleSpecies.length > 0}
            <SvelteVirtualList items={visibleSpecies} defaultEstimatedItemHeight={88}>
                {#snippet renderItem(species)}
                    <div class="px-2 pb-2" in:fade={{ duration: 120 }}>
                        <SpeciesListItem {species}/>
                    </div>
                {/snippet}
            </SvelteVirtualList>
        {:else if !isSearching}
            <p>No bird matches “{query}”</p>
        {/if}
    {/if}
</div>
