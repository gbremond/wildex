export type SpeciesImageSize = 'thumb' | 'medium';

export function speciesImageUrl(scientificName: string, size: SpeciesImageSize): string {
	return `https://birdnet.cornell.edu/taxonomy/api/image/${encodeURIComponent(scientificName)}?size=${size}`;
}

export function speciesPhotoTransitionName(id: string): string {
	return `species-photo-${id}`;
}
