import { base } from '$app/paths';
import { isSpecies, type Species } from '$lib/species/species.model';

const BIRDS_URL = `${base}/birds.json`;

export async function downloadBirds(): Promise<Species[]> {
	const response = await fetch(BIRDS_URL);

	if (!response.ok) {
		throw new Error(`Failed to download birds: ${response.status} ${response.statusText}`);
	}

	const birds: unknown = await response.json();

	if (!Array.isArray(birds)) throw new Error('Failed to download birds: expected an array');

	return birds.filter(isSpecies);
}
