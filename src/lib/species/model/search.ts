import type { Species } from './model';

export const MIN_QUERY_LENGTH = 2;

const COMBINING_MARKS = /\p{M}/gu;
const WHITESPACE = /\s+/;

// Decomposes accented letters into base + mark, then drops the marks, so "epervier"
// matches "Épervier". SQLite has no equivalent, so a future move to it would store
// the folded text in its own column, written through this same function.
export function fold(text: string): string {
	return text.normalize('NFD').replace(COMBINING_MARKS, '').toLowerCase();
}

function speciesText(species: Species): string {
	return `${species.scientificName} ${species.frenchName} ${species.englishName}`;
}

/** Every word typed must appear in the text; a query too short to mean anything matches all. */
export function matchesSearch(text: string, query: string): boolean {
	const normalizedQuery = fold(query).trim();

	if (normalizedQuery.length < MIN_QUERY_LENGTH) return true;

	const searchable = fold(text);
	return normalizedQuery.split(WHITESPACE).every((word) => searchable.includes(word));
}

export function searchSpecies(species: Species[], query: string): Species[] {
	return species.filter((candidate) => matchesSearch(speciesText(candidate), query));
}
