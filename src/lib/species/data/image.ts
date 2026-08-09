export type SpeciesImageSize = 'thumb' | 'medium';

export const SPECIES_IMAGE_HOST = 'birdnet.cornell.edu';

// The name is part of the on-device contract: changing this string orphans every
// photo already downloaded by an installed app, so it stays as first shipped.
export const SPECIES_IMAGE_CACHE = 'bird-images-v1';

export function speciesImageUrl(scientificName: string, size: SpeciesImageSize): string {
	return `https://${SPECIES_IMAGE_HOST}/taxonomy/api/image/${encodeURIComponent(scientificName)}?size=${size}`;
}
