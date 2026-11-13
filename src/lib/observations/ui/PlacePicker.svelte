<script lang="ts">
	import { onMount } from 'svelte';
	import type { LeafletMouseEvent, Map as LeafletMap, Marker } from 'leaflet';
	import { Button } from '$lib/components/ui/button';
	import LocateIcon from '@lucide/svelte/icons/locate';
	import { currentPosition, type Position } from '$lib/geolocation';
	import { m } from '$lib/paraglide/messages';
	import { FRANCE, addTiles, dotIcon, loadLeaflet, toLatLng, type Leaflet } from './leaflet';

	let { position = $bindable() }: { position?: Position } = $props();

	let L: Leaflet;
	let container: HTMLDivElement;
	let map: LeafletMap | undefined;
	let pin: Marker | undefined;
	let locating = $state(false);

	onMount(() => {
		const mapReady = showMap();
		return () => mapReady.then((readyMap) => readyMap.remove());
	});

	async function showMap(): Promise<LeafletMap> {
		L = await loadLeaflet();
		map = L.map(container);
		addTiles(L, map);

		if (position) {
			map.setView(toLatLng(position), 13);
			placePin(position);
		} else {
			map.setView(FRANCE, 5);
		}

		map.on('click', ({ latlng }: LeafletMouseEvent) =>
			placePin({ latitude: latlng.lat, longitude: latlng.lng })
		);
		return map;
	}

	function placePin(where: Position) {
		position = where;
		pin ??= L.marker(toLatLng(where), { icon: dotIcon(L) }).addTo(map!);
		pin.setLatLng(toLatLng(where));
	}

	async function useMyPosition() {
		locating = true;
		const here = await currentPosition();
		locating = false;
		if (!here) return;

		placePin(here);
		map?.setView(toLatLng(here), 14);
	}
</script>

<div class="flex flex-col gap-2">
	<div bind:this={container} class="isolate h-56 overflow-hidden rounded-2xl"></div>
	<div class="flex items-center justify-between gap-2">
		<p class="text-xs text-muted-foreground">{m.trip_form_place_hint()}</p>
		<Button variant="ghost" size="sm" disabled={locating} onclick={useMyPosition}>
			<LocateIcon data-icon="inline-start" />
			{m.map_use_my_position()}
		</Button>
	</div>
</div>
