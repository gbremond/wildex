import type { Species } from '$lib/species/species.model';

export const MIN_QUERY_LENGTH = 2;

const COMBINING_MARKS = /\p{M}/gu;
const WHITESPACE = /\s+/;

// Decomposes accented letters into base + mark, then drops the marks, so "epervier"
// matches "Épervier". SQLite has no equivalent, so a future move to it would store
// the folded text in its own column, written through this same function.
export function fold(text: string): string {
	return text.normalize('NFD').replace(COMBINING_MARKS, '').toLowerCase();
}

function searchableText(species: Species): string {
	return fold(`${species.scientificName} ${species.frenchName} ${species.englishName}`);
}

function matchesEveryWord(text: string, words: string[]): boolean {
	return words.every((word) => text.includes(word));
}

export function searchSpecies(species: Species[], query: string): Species[] {
	const normalizedQuery = fold(query).trim();

	if (normalizedQuery.length < MIN_QUERY_LENGTH) return species;

	const words = normalizedQuery.split(WHITESPACE);

	return species.filter((candidate) => matchesEveryWord(searchableText(candidate), words));
}
