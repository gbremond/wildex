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

export function canSubmitObservation(draft: ObservationDraft): boolean {
	const needsCapture = captureAccept(draft.method) !== null;

	if (draft.species.trim() === '') return false;
	if (draft.observedOn === '') return false;

	return !needsCapture || draft.capture !== null;
}
