import type { Position } from '$lib/geolocation';
import { localDay } from '$lib/local-date';
import type { Locale } from '$lib/paraglide/runtime';
import type { Species } from '$lib/species/model/model';
import type { IdentificationMethod } from './identification';

/** `name` is the French name, or whatever was typed for an unlisted species. */
export type ObservedSpecies = {
	name: string;
	englishName?: string;
	speciesId?: string;
	scientificName?: string;
};

export type Observation = {
	id: string;
	species: ObservedSpecies;
	observedAt: string;
	position: Position | null;
	tripId: string | null;
	method: IdentificationMethod;
	notes: string;
	capture: Blob | null;
};

export type ObservationFilter = { speciesId?: string; tripId?: string };

export type PhotoSource =
	{ kind: 'capture'; blob: Blob } | { kind: 'species'; scientificName: string } | { kind: 'none' };

export function observedSpeciesFrom(species: Species): ObservedSpecies {
	return {
		name: species.frenchName,
		englishName: species.englishName,
		speciesId: species.id,
		scientificName: species.scientificName
	};
}

export function observedName(species: ObservedSpecies, locale: Locale): string {
	return locale === 'en' && species.englishName ? species.englishName : species.name;
}

function matches(observation: Observation, { speciesId, tripId }: ObservationFilter): boolean {
	if (speciesId && observation.species.speciesId !== speciesId) return false;
	if (tripId && observation.tripId !== tripId) return false;
	return true;
}

function newestFirst(observations: Observation[]): Observation[] {
	return observations.toSorted((a, b) => b.observedAt.localeCompare(a.observedAt));
}

export function filterObservations(
	observations: Observation[],
	filter: ObservationFilter
): Observation[] {
	return newestFirst(observations.filter((observation) => matches(observation, filter)));
}

export function groupByDay(
	observations: Observation[]
): { day: string; observations: Observation[] }[] {
	const days = new Map<string, Observation[]>();

	for (const observation of newestFirst(observations)) {
		const day = localDay(new Date(observation.observedAt));
		days.set(day, [...(days.get(day) ?? []), observation]);
	}

	return [...days].map(([day, observations]) => ({ day, observations }));
}

export function photoOf({ capture, species }: Observation): PhotoSource {
	if (capture?.type.startsWith('image/')) return { kind: 'capture', blob: capture };
	if (species.scientificName) return { kind: 'species', scientificName: species.scientificName };
	return { kind: 'none' };
}
