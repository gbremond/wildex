import {
	galleryPhotosFrom,
	matchingTaxonId,
	type GalleryPhoto,
	type InaturalistPhoto,
	type InaturalistTaxon
} from '../model/gallery';

export const INATURALIST_HOSTS = ['api.inaturalist.org', 'inaturalist-open-data.s3.amazonaws.com'];

const API = 'https://api.inaturalist.org/v1';

// One visit to a species often means coming back to it: no need to ask twice.
const galleries = new Map<string, Promise<GalleryPhoto[]>>();

/**
 * More photos of a species, for when the device is online. Never stored for offline use:
 * the downloaded photo is the offline one.
 */
export function fetchGalleryPhotos(scientificName: string): Promise<GalleryPhoto[]> {
	if (!navigator.onLine) return Promise.resolve([]);

	let gallery = galleries.get(scientificName);
	if (!gallery) {
		gallery = findGalleryPhotos(scientificName).catch((cause) => {
			galleries.delete(scientificName);
			console.warn('Could not fetch more photos of', scientificName, cause);
			return [];
		});
		galleries.set(scientificName, gallery);
	}
	return gallery;
}

async function findGalleryPhotos(scientificName: string): Promise<GalleryPhoto[]> {
	const { results } = await getJson<{ results: InaturalistTaxon[] }>(
		`/taxa?rank=species&per_page=5&q=${encodeURIComponent(scientificName)}`
	);
	const taxonId = matchingTaxonId(results, scientificName);
	if (taxonId === undefined) return [];

	// The search leaves the photos out: only the taxon itself lists them.
	const taxon = await getJson<{ results: { taxon_photos: { photo: InaturalistPhoto }[] }[] }>(
		`/taxa/${taxonId}`
	);
	return galleryPhotosFrom(taxon.results[0]?.taxon_photos ?? []);
}

async function getJson<T>(path: string): Promise<T> {
	const response = await fetch(`${API}${path}`);
	if (!response.ok) throw new Error(`iNaturalist answered ${response.status} for ${path}`);
	return response.json();
}
