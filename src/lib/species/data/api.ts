import { base } from '$app/paths';
import { isSpecies, type Species } from '../model/model';

// The dataset ships as `birds.json` because TAXREF ingestion is bird-only for now.
const SPECIES_URL = `${base}/birds.json`;

export async function downloadSpecies(): Promise<Species[]> {
	const response = await fetch(SPECIES_URL);

	if (!response.ok) {
		throw new Error(`Failed to download species: ${response.status} ${response.statusText}`);
	}

	const downloaded: unknown = await response.json();

	if (!Array.isArray(downloaded)) throw new Error('Failed to download species: expected an array');

	return downloaded.filter(isSpecies);
}
