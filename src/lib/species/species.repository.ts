import { isSpecies, type Species } from '$lib/species/species.model';
import { searchSpecies as search } from '$lib/species/species.search';

const STORAGE_KEY = 'speciesList';

const speciesById = new Map<string, Species>();

async function loadSpeciesInMemory() {
	const storedSpecies = localStorage.getItem(STORAGE_KEY);

	if (storedSpecies) {
		const parsedSpecies: unknown = JSON.parse(storedSpecies);

		if (Array.isArray(parsedSpecies)) {
			parsedSpecies.filter(isSpecies).forEach((species) => speciesById.set(species.id, species));
		}
	}
}

async function addSpecies(downloaded: Species[]) {
	downloaded.forEach((species) => speciesById.set(species.id, species));
	localStorage.setItem(STORAGE_KEY, JSON.stringify([...speciesById.values()]));
}

async function getSpeciesList(): Promise<Species[]> {
	return [...speciesById.values()];
}

async function searchSpecies(query: string): Promise<Species[]> {
	return search([...speciesById.values()], query);
}

async function countAvailableSpecies(): Promise<number> {
	return speciesById.size;
}

export { loadSpeciesInMemory, addSpecies, getSpeciesList, searchSpecies, countAvailableSpecies };
