import type { Species } from '../model/model';

export function avibaseUrl(species: Species): string | null {
	if (!species.avibaseId) return null;

	return `https://avibase.bsc-eoc.org/species.jsp?lang=FR&avibaseid=${species.avibaseId}`;
}

export function xenoCantoUrl(species: Species): string {
	return `https://xeno-canto.org/species/${species.scientificName.replace(' ', '-')}`;
}
