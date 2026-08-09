import { isSpecies, type Species } from '../model/model';
import { searchSpecies } from '../model/search';

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

async function searchStoredSpecies(query: string): Promise<Species[]> {
	return searchSpecies([...speciesById.values()], query);
}

async function countAvailableSpecies(): Promise<number> {
	return speciesById.size;
}

async function findSpeciesById(id: string): Promise<Species | undefined> {
	return speciesById.get(id);
}

export {
	loadSpeciesInMemory,
	addSpecies,
	getSpeciesList,
	searchStoredSpecies,
	countAvailableSpecies,
	findSpeciesById
};
