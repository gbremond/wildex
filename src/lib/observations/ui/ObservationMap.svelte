<script lang="ts">
	import { getLocale } from '$lib/paraglide/runtime';
	import { m } from '$lib/paraglide/messages';
	import 'leaflet/dist/leaflet.css';
	import 'leaflet.markercluster/dist/MarkerCluster.css';
	import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
	import type {
		DivIcon,
		LatLngTuple,
		Map as LeafletMap,
		Marker,
		MarkerClusterGroup
	} from 'leaflet';
	import { flushSync, onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import { currentPosition, type Position } from '$lib/geolocation';
	import { MAP_TILE_URL } from '../data/map-tiles';
	import { speciesImageUrl } from '$lib/species/data/image';
	import { observedName, photoOf, type Observation } from '../model/observation';
	import ObservationPhoto from './ObservationPhoto.svelte';

	type Leaflet = typeof import('leaflet');
	type LocatedObservation = Observation & { position: Position };

	let { observations }: { observations: Observation[] } = $props();

	const FRANCE: LatLngTuple = [46.6, 2.4];
	const ATTRIBUTION = m.map_attribution({
		link: '<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
	});

	const dateTimeFormat = new Intl.DateTimeFormat(getLocale(), {
		dateStyle: 'medium',
		timeStyle: 'short'
	});

	let L: Leaflet;
	let container: HTMLDivElement;
	let details: HTMLDivElement;
	let selected = $state<Observation>();
	let map = $state.raw<LeafletMap>();
	let cluster = $state.raw<MarkerClusterGroup>();

	let located = $derived(observations.filter(isLocated));

	onMount(() => {
		const mapReady = showMap();
		return () => mapReady.then((readyMap) => readyMap.remove());
	});

	// Runs again when a filter changes, so picking a trip brings its observations into view.
	$effect(() => {
		if (!map || !cluster) return;
		cluster.clearLayers();
		cluster.addLayers(located.map(markerFor));
		if (located.length) fitTo(map, located);
	});

	function isLocated(observation: Observation): observation is LocatedObservation {
		return observation.position !== null;
	}

	function toLatLng({ latitude, longitude }: Position): LatLngTuple {
		return [latitude, longitude];
	}

	// The plugin extends the global `L` that Leaflet sets, so it must load second.
	async function loadLeaflet(): Promise<Leaflet> {
		const { default: leaflet } = await import('leaflet');
		await import('leaflet.markercluster');
		return leaflet;
	}

	async function showMap(): Promise<LeafletMap> {
		L = await loadLeaflet();
		const leafletMap = L.map(container);

		L.tileLayer(MAP_TILE_URL, { maxZoom: 19, attribution: ATTRIBUTION }).addTo(leafletMap);
		cluster = L.markerClusterGroup().addTo(leafletMap);

		if (located.length === 0) await showWhereIAm(leafletMap);
		map = leafletMap;
		return leafletMap;
	}

	function fitTo(leafletMap: LeafletMap, observations: LocatedObservation[]) {
		const bounds = L.latLngBounds(observations.map(({ position }) => toLatLng(position)));
		leafletMap.fitBounds(bounds, { maxZoom: 14, padding: [32, 32] });
	}

	async function showWhereIAm(leafletMap: LeafletMap): Promise<void> {
		leafletMap.setView(FRANCE, 5);
		const position = await currentPosition();
		if (position) leafletMap.setView(toLatLng(position), 12);
	}

	function iconFor(observation: Observation): DivIcon {
		const photo = photoOf(observation);

		// Captured photos are left out: each would need an object URL alive as long as the map.
		// Leaflet's default icon is an image Vite does not bundle, hence a CSS dot.
		if (photo.kind !== 'species') {
			return L.divIcon({
				className: 'rounded-full border-2 border-white bg-primary shadow',
				iconSize: [16, 16]
			});
		}

		// Leaflet's stylesheet resets marker images to `width: auto`, hence the `!`.
		return L.divIcon({
			className: 'overflow-hidden rounded-full border-2 border-white shadow-md',
			html: `<img src="${speciesImageUrl(photo.scientificName, 'thumb')}" alt="" class="size-full! object-cover">`,
			iconSize: [36, 36]
		});
	}

	function markerFor(observation: LocatedObservation): Marker {
		const marker = L.marker(toLatLng(observation.position), {
			icon: iconFor(observation),
			title: observedName(observation.species, getLocale())
		});

		return marker.bindPopup(() => detailsOf(observation));
	}

	// Leaflet sizes the popup as it opens, so the details must be rendered by then.
	function detailsOf(observation: Observation): HTMLElement {
		flushSync(() => (selected = observation));
		return details;
	}
</script>

<div bind:this={container} class="isolate h-[60vh] overflow-hidden rounded-2xl"></div>

<div hidden>
	<div bind:this={details} class="flex items-center gap-3 font-sans">
		{#if selected}
			<ObservationPhoto observation={selected} class="size-14 shrink-0" />
			<div class="min-w-0">
				{#if selected.species.speciesId}
					<a
						href={resolve('/species/[id]', { id: selected.species.speciesId })}
						class="block truncate text-sm font-medium text-foreground! hover:underline"
					>
						{observedName(selected.species, getLocale())}
					</a>
				{:else}
					<span class="block truncate text-sm font-medium"
						>{observedName(selected.species, getLocale())}</span
					>
				{/if}
				<span class="block text-xs text-muted-foreground">
					{dateTimeFormat.format(new Date(selected.observedAt))}
				</span>
			</div>
		{/if}
	</div>
</div>
