import { describe, it, expect } from 'vitest';
import { isSpecies, xenoCantoUrl, type Species } from './species.model';

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
		...overrides
	};
}

describe('isSpecies', () => {
	it('accepts a species without description or iucnCategory', () => {
		expect(isSpecies(validSpecies())).toBe(true);
	});

	it('accepts a species with a valid description and iucnCategory', () => {
		expect(
			isSpecies(validSpecies({ description: 'A small finch.', iucnCategory: 'LEAST_CONCERN' }))
		).toBe(true);
	});

	it('rejects a non-string description', () => {
		expect(isSpecies(validSpecies({ description: 42 }))).toBe(false);
	});

	it('rejects an iucnCategory outside IUCN_CATEGORIES', () => {
		expect(isSpecies(validSpecies({ iucnCategory: 'NOT_A_CATEGORY' }))).toBe(false);
	});
});

describe('xenoCantoUrl', () => {
	it('builds a species page URL from the scientific name', () => {
		const species = validSpecies() as Species;

		expect(xenoCantoUrl(species)).toBe('https://xeno-canto.org/species/Acanthis-flammea');
	});
});
