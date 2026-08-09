export type SpeciesImageSize = 'thumb' | 'medium';

export const BIRD_IMAGE_HOST = 'birdnet.cornell.edu';

export function speciesImageUrl(scientificName: string, size: SpeciesImageSize): string {
	return `https://${BIRD_IMAGE_HOST}/taxonomy/api/image/${encodeURIComponent(scientificName)}?size=${size}`;
}

export function speciesPhotoTransitionName(id: string): string {
	return `species-photo-${id}`;
}
