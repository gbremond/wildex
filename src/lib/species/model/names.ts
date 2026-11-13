import type { Locale } from '$lib/paraglide/runtime';
import type { Species } from './model';

export function speciesName(species: Species, locale: Locale): string {
	return locale === 'fr' ? species.frenchName : species.englishName;
}

export function otherLanguageName(species: Species, locale: Locale): string {
	return locale === 'fr' ? species.englishName : species.frenchName;
}

/** Wikipedia FR has no article for some species, so French falls back to English. */
export function speciesDescription(species: Species, locale: Locale): string | undefined {
	return locale === 'fr' ? (species.frenchDescription ?? species.description) : species.description;
}
