import type { Position } from '$lib/geolocation';
import { captureAccept, type IdentificationMethod } from './identification';
import type { Observation, ObservedSpecies } from './observation';
import type { Trip } from './trip';

export type ObservationDraft = {
	method: IdentificationMethod;
	species: ObservedSpecies;
	/** As typed in a datetime-local input: local time, minute precision. */
	observedAt: string;
	notes: string;
	capture: File | null;
};

export type IdentifiedSpecies = {
	species: ObservedSpecies;
	capture: File | null;
};

/**
 * One listening session can turn up several birds, and each is its own sighting
 * — same place, same moment, but its own species and its own recording.
 */
export function toObservations(
	shared: Pick<ObservationDraft, 'method' | 'observedAt' | 'notes'>,
	identified: IdentifiedSpecies[]
): ObservationDraft[] {
	return identified.map(({ species, capture }) => ({ ...shared, species, capture }));
}

export function canSubmitObservations(drafts: ObservationDraft[]): boolean {
	return drafts.length > 0 && drafts.every(canSubmitObservation);
}

export function canSubmitObservation(draft: ObservationDraft): boolean {
	const needsCapture = captureAccept(draft.method) !== null;

	if (draft.species.name.trim() === '') return false;
	if (draft.observedAt === '') return false;

	return !needsCapture || draft.capture !== null;
}

const JUST_NOW_MS = 60 * 60_000;

/** The phone's position only says where the bird was if it was seen just now. */
export function wasSeenJustNow(observedAt: string, now: Date): boolean {
	return now.getTime() - new Date(observedAt).getTime() <= JUST_NOW_MS;
}

/** The phone's fix for an observation made just now, otherwise where its trip took place. */
export function whereSeen({
	observedAt,
	now,
	here,
	trip
}: {
	observedAt: string;
	now: Date;
	here: Position | null;
	trip: Trip | undefined;
}): Position | null {
	const tripPosition = trip?.position ?? null;
	return wasSeenJustNow(observedAt, now) ? (here ?? tripPosition) : tripPosition;
}

export function toObservation(
	draft: ObservationDraft,
	context: { position: Position | null; tripId: string | null }
): Observation {
	return {
		...context,
		id: crypto.randomUUID(),
		species: { ...draft.species, name: draft.species.name.trim() },
		observedAt: new Date(draft.observedAt).toISOString(),
		method: draft.method,
		notes: draft.notes.trim(),
		capture: draft.capture
	};
}
