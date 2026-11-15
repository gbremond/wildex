/** The fields read from iNaturalist's `/v1/taxa` answers. */
export type InaturalistTaxon = { id: number; name: string; rank: string; is_active: boolean };

export type InaturalistPhoto = {
	id: number;
	license_code: string | null;
	attribution_name: string | null;
	medium_url: string;
	large_url: string;
	flags: unknown[];
};

export type GalleryPhoto = { id: number; url: string; largeUrl: string; credit: string };

// Enough to get a feel for the bird without making every visit a big download.
export const MAX_GALLERY_PHOTOS = 8;

/** A search by name also returns subspecies and look-alikes: only the species itself counts. */
export function matchingTaxonId(
	results: InaturalistTaxon[],
	scientificName: string
): number | undefined {
	const wanted = scientificName.toLowerCase();

	return results.find(
		({ name, rank, is_active }) => is_active && rank === 'species' && name.toLowerCase() === wanted
	)?.id;
}

/** Only openly licensed, unflagged photos are shown, each with its credit. */
export function galleryPhotosFrom(taxonPhotos: { photo: InaturalistPhoto }[]): GalleryPhoto[] {
	return taxonPhotos
		.map(({ photo }) => photo)
		.filter(({ license_code, flags }) => license_code !== null && flags.length === 0)
		.slice(0, MAX_GALLERY_PHOTOS)
		.map((photo) => ({
			id: photo.id,
			url: photo.medium_url,
			largeUrl: photo.large_url,
			credit: `© ${photo.attribution_name ?? 'iNaturalist'} · ${licenceName(photo.license_code!)}`
		}));
}

// `cc-by-nc-sa` reads as "CC BY-NC-SA", the way Creative Commons writes it.
function licenceName(code: string): string {
	return code.toUpperCase().replace(/^CC-/, 'CC ');
}
