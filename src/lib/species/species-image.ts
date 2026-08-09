export type SpeciesImageSize = 'thumb' | 'medium';

export function speciesImageUrl(scientificName: string, size: SpeciesImageSize): string {
	return `https://birdnet.cornell.edu/taxonomy/api/image/${encodeURIComponent(scientificName)}?size=${size}`;
}
