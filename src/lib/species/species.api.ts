import type { Species } from '$lib/species/species.model';

const NETWORK_DELAY_MS = 300;

const BIRDS: Species[] = [
	{ id: 'erirub', commonName: 'European Robin', scientificName: 'Erithacus rubecula' },
	{ id: 'cyacae', commonName: 'Eurasian Blue Tit', scientificName: 'Cyanistes caeruleus' },
	{ id: 'pasdom', commonName: 'House Sparrow', scientificName: 'Passer domesticus' },
	{ id: 'turmer', commonName: 'Common Blackbird', scientificName: 'Turdus merula' },
	{ id: 'picpic', commonName: 'Eurasian Magpie', scientificName: 'Pica pica' },
	{ id: 'delurb', commonName: 'Common House Martin', scientificName: 'Delichon urbicum' }
];

export async function downloadBirds(): Promise<Species[]> {
	await new Promise((resolve) => setTimeout(resolve, NETWORK_DELAY_MS));
	return BIRDS;
}
