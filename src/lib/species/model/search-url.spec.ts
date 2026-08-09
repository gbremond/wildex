import { describe, it, expect } from 'vitest';
import { NO_FILTERS, type SpeciesFilters } from './filters';
import { readSearchParams, toSearchPath } from './search-url';

function read(search: string) {
	return readSearchParams(new URLSearchParams(search));
}

describe('readSearchParams', () => {
	it('reads an empty search as an empty query and no filter', () => {
		expect(read('')).toEqual({ query: '', filters: NO_FILTERS });
	});

	it('reads the query', () => {
		expect(read('?q=merle').query).toBe('merle');
	});

	it('reads a repeated facet as several selected values', () => {
		expect(read('?status=NATIVE&status=INVASIVE').filters.status).toEqual(['NATIVE', 'INVASIVE']);
	});

	it('reads every facet at once', () => {
		const { filters } = read('?status=NATIVE&order=Passeriformes&habitat=MARINE&iucn=UNKNOWN');

		expect(filters).toEqual({
			status: ['NATIVE'],
			order: ['Passeriformes'],
			habitat: ['MARINE'],
			iucn: ['UNKNOWN']
		});
	});

	it('drops values outside the known statuses', () => {
		expect(read('?status=NATIVE&status=MYTHICAL').filters.status).toEqual(['NATIVE']);
	});

	it('drops values outside the known habitats', () => {
		expect(read('?habitat=LUNAR').filters.habitat).toEqual([]);
	});

	it('drops values outside the known IUCN categories', () => {
		expect(read('?iucn=VULNERABLE&iucn=DOOMED').filters.iucn).toEqual(['VULNERABLE']);
	});

	it('keeps orders as written, since they are free text', () => {
		expect(read('?order=Made+Up').filters.order).toEqual(['Made Up']);
	});
});

describe('toSearchPath', () => {
	it('writes the bare path when nothing is searched', () => {
		expect(toSearchPath('', NO_FILTERS)).toBe('/');
	});

	it('writes the query alone', () => {
		expect(toSearchPath('merle', NO_FILTERS)).toBe('/?q=merle');
	});

	it('repeats a facet key for each selected value', () => {
		const filters = { ...NO_FILTERS, status: ['NATIVE', 'INVASIVE'] } as SpeciesFilters;

		expect(toSearchPath('', filters)).toBe('/?status=NATIVE&status=INVASIVE');
	});

	it('omits the facets with nothing selected', () => {
		const filters = { ...NO_FILTERS, habitat: ['MARINE'] } as SpeciesFilters;

		expect(toSearchPath('', filters)).toBe('/?habitat=MARINE');
	});

	it('escapes the query', () => {
		expect(toSearchPath("d'europe & co", NO_FILTERS)).toBe('/?q=d%27europe+%26+co');
	});
});

describe('a written search', () => {
	const CASES: { query: string; filters: SpeciesFilters }[] = [
		{ query: '', filters: NO_FILTERS },
		{ query: 'merle noir', filters: NO_FILTERS },
		{
			query: 'goéland',
			filters: {
				status: ['NATIVE', 'INVASIVE'],
				order: ['Charadriiformes'],
				habitat: ['MARINE'],
				iucn: ['VULNERABLE', 'UNKNOWN']
			}
		}
	];

	it.each(CASES)('reads back as it was written for "$query"', ({ query, filters }) => {
		const written = new URL(toSearchPath(query, filters), 'https://wildex.test');

		expect(read(written.search)).toEqual({ query, filters });
	});
});
