import { describe, expect, it } from 'vitest';
import type { Species } from './model';
import { otherLanguageName, speciesDescription, speciesName } from './names';

const redpoll = {
	frenchName: 'Sizerin flammé',
	englishName: 'Common Redpoll',
	description: 'The redpoll is a small finch.',
	frenchDescription: 'Le sizerin flammé est un petit passereau.'
} as Species;

describe('speciesName', () => {
	it('is the name in the language of the app', () => {
		expect(speciesName(redpoll, 'fr')).toBe('Sizerin flammé');
		expect(speciesName(redpoll, 'en')).toBe('Common Redpoll');
	});
});

describe('otherLanguageName', () => {
	it('is the name in the language the app is not in', () => {
		expect(otherLanguageName(redpoll, 'fr')).toBe('Common Redpoll');
	});
});

describe('speciesDescription', () => {
	it('is the description in the language of the app', () => {
		expect(speciesDescription(redpoll, 'fr')).toBe(redpoll.frenchDescription);
		expect(speciesDescription(redpoll, 'en')).toBe(redpoll.description);
	});

	it('falls back to English when there is no French description', () => {
		const withoutFrench = { ...redpoll, frenchDescription: undefined };

		expect(speciesDescription(withoutFrench, 'fr')).toBe(redpoll.description);
	});
});
