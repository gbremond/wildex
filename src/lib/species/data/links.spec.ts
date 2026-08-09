import { describe, it, expect } from 'vitest';
import { avibaseUrl, xenoCantoUrl } from './links';
import type { Species } from '../model/model';

function species(overrides: Partial<Species> = {}): Species {
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

describe('xenoCantoUrl', () => {
	it('builds a species page URL from the scientific name', () => {
		expect(xenoCantoUrl(species())).toBe('https://xeno-canto.org/species/Acanthis-flammea');
	});
});

describe('avibaseUrl', () => {
	it('builds a species page URL from the avibase id', () => {
		expect(avibaseUrl(species({ avibaseId: '9E1E0B0A' }))).toBe(
			'https://avibase.bsc-eoc.org/species.jsp?lang=FR&avibaseid=9E1E0B0A'
		);
	});

	it('returns null for a species without an avibase id', () => {
		expect(avibaseUrl(species())).toBeNull();
	});
});
