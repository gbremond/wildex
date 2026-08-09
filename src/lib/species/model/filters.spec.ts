import { describe, it, expect } from 'vitest';
import type { IucnCategory, Species, Status } from './model';
import {
	NO_FILTERS,
	countSelectedFilters,
	distinctOrders,
	filterSpecies,
	type SpeciesFilters
} from './filters';

function bird(
	id: string,
	order: string,
	status: Status,
	habitat: Species['habitat'],
	iucnCategory?: IucnCategory
): Species {
	return {
		id,
		scientificName: `Scientificus ${id}`,
		frenchName: `Oiseau ${id}`,
		englishName: `Bird ${id}`,
		order,
		family: 'Turdidae',
		habitat,
		status,
		iucnCategory
	};
}

const CATALOGUE: Species[] = [
	bird('blackbird', 'Passeriformes', 'NATIVE', 'TERRESTRIAL', 'LEAST_CONCERN'),
	bird('robin', 'Passeriformes', 'NATIVE', 'TERRESTRIAL'),
	bird('gull', 'Charadriiformes', 'NATIVE', 'MARINE', 'VULNERABLE'),
	bird('ibis', 'Pelecaniformes', 'INVASIVE', 'FRESHWATER', 'LEAST_CONCERN'),
	bird('parakeet', 'Psittaciformes', 'INTRODUCED', 'TERRESTRIAL')
];

function found(filters: Partial<SpeciesFilters>): string[] {
	return filterSpecies(CATALOGUE, { ...NO_FILTERS, ...filters }).map((species) => species.id);
}

describe('filterSpecies', () => {
	it('keeps every species when no facet is selected', () => {
		expect(found({})).toEqual(CATALOGUE.map((species) => species.id));
	});

	it('keeps the species matching the only selected status', () => {
		expect(found({ status: ['INVASIVE'] })).toEqual(['ibis']);
	});

	it('accepts any selected value within a facet', () => {
		expect(found({ status: ['INVASIVE', 'INTRODUCED'] })).toEqual(['ibis', 'parakeet']);
	});

	it('narrows facets against each other', () => {
		expect(found({ status: ['NATIVE'], habitat: ['MARINE'] })).toEqual(['gull']);
	});

	it('returns nothing when facets contradict each other', () => {
		expect(found({ status: ['INVASIVE'], habitat: ['MARINE'] })).toEqual([]);
	});

	it('filters on the free text order', () => {
		expect(found({ order: ['Passeriformes'] })).toEqual(['blackbird', 'robin']);
	});

	it('matches species without an IUCN category under UNKNOWN', () => {
		expect(found({ iucn: ['UNKNOWN'] })).toEqual(['robin', 'parakeet']);
	});

	it('does not match assessed species under UNKNOWN alone', () => {
		expect(found({ iucn: ['LEAST_CONCERN'] })).toEqual(['blackbird', 'ibis']);
	});

	it('combines UNKNOWN with real categories', () => {
		expect(found({ iucn: ['VULNERABLE', 'UNKNOWN'] })).toEqual(['robin', 'gull', 'parakeet']);
	});

	it('keeps the order of the given list', () => {
		expect(found({ habitat: ['TERRESTRIAL'] })).toEqual(['blackbird', 'robin', 'parakeet']);
	});

	it('does not modify the given list', () => {
		filterSpecies(CATALOGUE, { ...NO_FILTERS, status: ['INVASIVE'] });

		expect(CATALOGUE).toHaveLength(5);
	});
});

describe('countSelectedFilters', () => {
	it('counts nothing when no facet is selected', () => {
		expect(countSelectedFilters(NO_FILTERS)).toBe(0);
	});

	it('adds up the values selected across every facet', () => {
		const filters = { status: ['NATIVE'], order: ['Passeriformes'], habitat: [], iucn: [] };

		expect(countSelectedFilters(filters as SpeciesFilters)).toBe(2);
	});
});

describe('distinctOrders', () => {
	it('lists each order once, alphabetically', () => {
		expect(distinctOrders(CATALOGUE)).toEqual([
			'Charadriiformes',
			'Passeriformes',
			'Pelecaniformes',
			'Psittaciformes'
		]);
	});

	it('lists nothing for an empty catalogue', () => {
		expect(distinctOrders([])).toEqual([]);
	});
});
