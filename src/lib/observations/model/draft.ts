import { captureAccept, type IdentificationMethod } from './identification';

export type ObservationDraft = {
	method: IdentificationMethod;
	species: string;
	observedOn: string;
	notes: string;
	capture: File | null;
};

export function toDateInputValue(date: Date): string {
	const localMidnight = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
	return localMidnight.toISOString().slice(0, 10);
}

export type IdentifiedSpecies = {
	species: string;
	capture: File | null;
};

/**
 * One listening session can turn up several birds, and each is its own sighting
 * — same place, same moment, but its own species and its own recording.
 */
export function toObservations(
	shared: Pick<ObservationDraft, 'method' | 'observedOn' | 'notes'>,
	identified: IdentifiedSpecies[]
): ObservationDraft[] {
	return identified.map(({ species, capture }) => ({ ...shared, species, capture }));
}

export function canSubmitObservations(drafts: ObservationDraft[]): boolean {
	return drafts.length > 0 && drafts.every(canSubmitObservation);
}

export function canSubmitObservation(draft: ObservationDraft): boolean {
	const needsCapture = captureAccept(draft.method) !== null;

	if (draft.species.trim() === '') return false;
	if (draft.observedOn === '') return false;

	return !needsCapture || draft.capture !== null;
}
