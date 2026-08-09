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

export const IUCN_CATEGORIES = [
	'LEAST_CONCERN',
	'NEAR_THREATENED',
	'VULNERABLE',
	'ENDANGERED',
	'CRITICALLY_ENDANGERED',
	'EXTINCT_IN_THE_WILD',
	'EXTINCT',
	'DATA_DEFICIENT'
] as const;

export type Habitat = (typeof HABITATS)[number];
export type Status = (typeof STATUSES)[number];
export type IucnCategory = (typeof IUCN_CATEGORIES)[number];

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
	description?: string;
	iucnCategory?: IucnCategory;
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
		(species.avibaseId === undefined || typeof species.avibaseId === 'string') &&
		(species.description === undefined || typeof species.description === 'string') &&
		(species.iucnCategory === undefined || isOneOf(IUCN_CATEGORIES, species.iucnCategory))
	);
}
