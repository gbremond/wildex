export const HABITATS = [
	'MARINE',
	'FRESHWATER',
	'TERRESTRIAL',
	'MARINE_AND_FRESHWATER',
	'MARINE_AND_TERRESTRIAL',
	'BRACKISH',
	'CONTINENTAL',
	'TERRESTRIAL_AND_FRESHWATER'
] as const;

export const STATUSES = [
	'NATIVE',
	'ENDEMIC',
	'SUBENDEMIC',
	'INTRODUCED',
	'INVASIVE',
	'OCCASIONAL'
] as const;

export type Habitat = (typeof HABITATS)[number];
export type Status = (typeof STATUSES)[number];

export type Species = {
	id: string;
	scientificName: string;
	frenchName: string;
	englishName: string;
	order: string;
	family: string;
	habitat: Habitat;
	status: Status;
	avibaseId?: string;
};

function isOneOf<Value extends string>(values: readonly Value[], value: unknown): value is Value {
	return values.includes(value as Value);
}

export function isSpecies(value: unknown): value is Species {
	if (typeof value !== 'object' || value === null) return false;

	const species = value as Species;

	return (
		typeof species.id === 'string' &&
		typeof species.scientificName === 'string' &&
		typeof species.frenchName === 'string' &&
		typeof species.englishName === 'string' &&
		typeof species.order === 'string' &&
		typeof species.family === 'string' &&
		isOneOf(HABITATS, species.habitat) &&
		isOneOf(STATUSES, species.status) &&
		(species.avibaseId === undefined || typeof species.avibaseId === 'string')
	);
}

export function readableLabel(value: Habitat | Status): string {
	const words = value.toLowerCase().replaceAll('_', ' ');

	return words.charAt(0).toUpperCase() + words.slice(1);
}

export function avibaseUrl(species: Species): string | null {
	if (!species.avibaseId) return null;

	return `https://avibase.bsc-eoc.org/species.jsp?lang=FR&avibaseid=${species.avibaseId}`;
}
