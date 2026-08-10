import { describe, it, expect } from 'vitest';
import { isSpecies } from './model';

function validSpecies(overrides: Record<string, unknown> = {}): unknown {
	return {
		id: '4597',
		scientificName: 'Acanthis flammea',
		frenchName: 'Sizerin flammé',
		englishName: 'Common Redpoll',
		order: 'Passeriformes',
		family: 'Fringillidae',
		habitat: 'TERRESTRIAL',
		status: 'NATIVE',
		iucnCategory: 'LEAST_CONCERN',
		...overrides
	};
}

describe('isSpecies', () => {
	it('accepts a species without description', () => {
		expect(isSpecies(validSpecies())).toBe(true);
	});

	it('accepts a species with a valid description', () => {
		expect(isSpecies(validSpecies({ description: 'A small finch.' }))).toBe(true);
	});

	it('accepts UNKNOWN as an iucnCategory', () => {
		expect(isSpecies(validSpecies({ iucnCategory: 'UNKNOWN' }))).toBe(true);
	});

	it('rejects a non-string description', () => {
		expect(isSpecies(validSpecies({ description: 42 }))).toBe(false);
	});

	it('rejects an iucnCategory outside IUCN_CATEGORIES', () => {
		expect(isSpecies(validSpecies({ iucnCategory: 'NOT_A_CATEGORY' }))).toBe(false);
	});

	it('rejects a species without an iucnCategory', () => {
		expect(isSpecies(validSpecies({ iucnCategory: undefined }))).toBe(false);
	});
});
