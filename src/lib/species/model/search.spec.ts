import { describe, it, expect } from 'vitest';
import type { Species } from './model';
import { fold, searchSpecies } from './search';

function bird(
	id: string,
	scientificName: string,
	frenchName: string,
	englishName: string
): Species {
	return {
		id,
		scientificName,
		frenchName,
		englishName,
		order: 'Passeriformes',
		family: 'Turdidae',
		habitat: 'TERRESTRIAL',
		status: 'NATIVE'
	};
}

const CATALOGUE: Species[] = [
	bird('4117', 'Turdus merula', 'Merle noir', 'Common Blackbird'),
	bird('3571', 'Alcedo atthis', "Martin-pêcheur d'Europe", 'Common Kingfisher'),
	bird('2895', 'Accipiter nisus', "Épervier d'Europe", 'Eurasian Sparrowhawk'),
	bird('3302', 'Larus argentatus', 'Goéland argenté', 'Herring Gull'),
	bird('4001', 'Erithacus rubecula', 'Rougegorge familier', 'European Robin')
];

const EVERY_BIRD = CATALOGUE.map((species) => species.id);

const CASES: { query: string; expected: string[]; reason: string }[] = [
	{ query: 'merle', expected: ['4117'], reason: 'plain french name' },
	{ query: 'Merle', expected: ['4117'], reason: 'case insensitive' },
	{ query: 'turdus', expected: ['4117'], reason: 'scientific name' },
	{ query: 'blackbird', expected: ['4117'], reason: 'english name' },

	{ query: 'epervier', expected: ['2895'], reason: 'accent folded away in the query' },
	{ query: 'Épervier', expected: ['2895'], reason: 'accent typed exactly still matches' },
	{ query: 'goeland argente', expected: ['3302'], reason: 'several folded accents' },
	{ query: 'pecheur', expected: ['3571'], reason: 'matches after a hyphen' },
	{ query: "d'europe", expected: ['3571', '2895'], reason: 'apostrophe kept' },

	{ query: 'merle noir', expected: ['4117'], reason: 'every word must match' },
	{ query: 'noir merle', expected: ['4117'], reason: 'word order is irrelevant' },
	{ query: 'turdus noir', expected: ['4117'], reason: 'words may span different fields' },
	{ query: '  merle   noir  ', expected: ['4117'], reason: 'extra whitespace ignored' },

	{ query: 'common', expected: ['4117', '3571'], reason: 'several matches' },
	{ query: 'pingouin', expected: [], reason: 'no match' },

	{ query: '', expected: EVERY_BIRD, reason: 'empty query filters nothing' },
	{ query: '   ', expected: EVERY_BIRD, reason: 'blank query filters nothing' },
	{ query: 'm', expected: EVERY_BIRD, reason: 'below the minimum length filters nothing' },
	{ query: 'me', expected: ['4117'], reason: 'exactly the minimum length searches' }
];

describe('searchSpecies', () => {
	it.each(CASES)('$query -> $reason', ({ query, expected }) => {
		const found = searchSpecies(CATALOGUE, query).map((species) => species.id);

		expect(found).toEqual(expected);
	});

	it('keeps the order of the given list', () => {
		const found = searchSpecies(CATALOGUE, 'e').map((species) => species.id);

		expect(found).toEqual(EVERY_BIRD);
	});

	it('does not modify the given list', () => {
		searchSpecies(CATALOGUE, 'merle');

		expect(CATALOGUE).toHaveLength(5);
	});
});

describe('fold', () => {
	it.each([
		['Épervier', 'epervier'],
		['Goéland argenté', 'goeland argente'],
		['Rousserolle turdoïde', 'rousserolle turdoide'],
		['Martin-pêcheur', 'martin-pecheur'],
		['Merle noir', 'merle noir']
	])('folds %s to %s', (input, expected) => {
		expect(fold(input)).toBe(expected);
	});
});
