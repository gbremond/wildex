let transitioningSpeciesId = $state<string | null>(null);

export function markSpeciesTransition(id: string): void {
	transitioningSpeciesId = id;
}

export function isSpeciesTransitioning(id: string): boolean {
	return transitioningSpeciesId === id;
}

export function speciesPhotoTransitionName(id: string): string {
	return `species-photo-${id}`;
}
