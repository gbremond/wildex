import 'leaflet/dist/leaflet.css';
import type { DivIcon, LatLngTuple, Map as LeafletMap } from 'leaflet';
import type { Position } from '$lib/geolocation';
import { m } from '$lib/paraglide/messages';
import { MAP_TILE_URL } from '../data/map-tiles';

export type Leaflet = typeof import('leaflet');

export const FRANCE: LatLngTuple = [46.6, 2.4];

// Imported on demand: Leaflet touches `window`, and pages are prerendered.
// The cluster plugin extends the global `L` that Leaflet sets, so it must load second.
export async function loadLeaflet(): Promise<Leaflet> {
	const { default: leaflet } = await import('leaflet');
	await import('leaflet.markercluster');
	return leaflet;
}

export function addTiles(L: Leaflet, map: LeafletMap) {
	const attribution = m.map_attribution({
		link: '<a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
	});
	L.tileLayer(MAP_TILE_URL, { maxZoom: 19, attribution }).addTo(map);
}

// Leaflet's default icon is an image Vite does not bundle, hence a CSS dot.
export function dotIcon(L: Leaflet): DivIcon {
	return L.divIcon({
		className: 'rounded-full border-2 border-white bg-primary shadow',
		iconSize: [16, 16]
	});
}

export function toLatLng({ latitude, longitude }: Position): LatLngTuple {
	return [latitude, longitude];
}
