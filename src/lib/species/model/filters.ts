import {
	IUCN_CATEGORIES,
	type Habitat,
	type IucnCategory,
	type Species,
	type Status
} from './model';

export const UNKNOWN_IUCN = 'UNKNOWN';

export type IucnFilterValue = IucnCategory | typeof UNKNOWN_IUCN;

export const IUCN_FILTER_VALUES = [...IUCN_CATEGORIES, UNKNOWN_IUCN] as const;

export type SpeciesFilters = {
	status: Status[];
	order: string[];
	habitat: Habitat[];
	iucn: IucnFilterValue[];
};

export const NO_FILTERS: SpeciesFilters = { status: [], order: [], habitat: [], iucn: [] };

// A facet with nothing selected constrains nothing; a facet with several values
// accepts any of them. Facets then narrow each other.
function matchesFacet<Value>(selected: Value[], value: Value): boolean {
	return selected.length === 0 || selected.includes(value);
}

function iucnValue(species: Species): IucnFilterValue {
	return species.iucnCategory ?? UNKNOWN_IUCN;
}

function matchesEveryFacet(species: Species, filters: SpeciesFilters): boolean {
	return (
		matchesFacet(filters.status, species.status) &&
		matchesFacet(filters.order, species.order) &&
		matchesFacet(filters.habitat, species.habitat) &&
		matchesFacet(filters.iucn, iucnValue(species))
	);
}

export function filterSpecies(species: Species[], filters: SpeciesFilters): Species[] {
	return species.filter((candidate) => matchesEveryFacet(candidate, filters));
}

export function countSelectedFilters(filters: SpeciesFilters): number {
	return (
		filters.status.length + filters.order.length + filters.habitat.length + filters.iucn.length
	);
}

// Orders are free text on the species, so their facet options can only come
// from what was actually downloaded.
export function distinctOrders(species: Species[]): string[] {
	const orders = new Set(species.map((candidate) => candidate.order));

	return [...orders].sort((one, other) => one.localeCompare(other));
}
