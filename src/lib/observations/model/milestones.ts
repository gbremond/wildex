import type { Observation, ObservedSpecies } from './observation';

// Unlisted species were typed by hand, so the same bird may come back with
// different capitals.
function speciesKey({ speciesId, name }: ObservedSpecies): string {
	return speciesId ?? name.toLocaleLowerCase();
}

function speciesKeysOf(observations: Observation[]): Set<string> {
	return new Set(observations.map(({ species }) => speciesKey(species)));
}

/** The saved observations whose species was not in the journal yet: the "lifers". */
export function firstSightings(saved: Observation[], journal: Observation[]): Observation[] {
	const alreadySeen = speciesKeysOf(journal);

	return saved.filter(({ species }) => !alreadySeen.has(speciesKey(species)));
}

export function lifeListSize(journal: Observation[]): number {
	return speciesKeysOf(journal).size;
}
