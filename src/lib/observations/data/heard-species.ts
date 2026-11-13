import type { HeardSpecies } from '$lib/birdnet/model/live';
import { findSpeciesByScientificName, loadSpeciesInMemory } from '$lib/species/data/repository';
import { observedSpeciesFrom, type ObservedSpecies } from '../model/observation';

/** Linking BirdNET's names to the downloaded list is what puts them on their species card. */
export async function toObservedSpecies({
	scientific,
	common
}: HeardSpecies): Promise<ObservedSpecies> {
	await loadSpeciesInMemory();
	const listed = await findSpeciesByScientificName(scientific);

	return listed ? observedSpeciesFrom(listed) : { name: common, scientificName: scientific };
}
