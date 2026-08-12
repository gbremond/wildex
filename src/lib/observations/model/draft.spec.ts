import { describe, expect, it } from 'vitest';
import { canSubmitObservation, toDateInputValue, type ObservationDraft } from './draft';

function draftWith(overrides: Partial<ObservationDraft> = {}): ObservationDraft {
	return {
		method: 'manual',
		species: 'Common kingfisher',
		observedOn: '2026-08-12',
		notes: '',
		capture: null,
		...overrides
	};
}

const anyCapture = new File([], 'kingfisher.jpg');

describe('toDateInputValue', () => {
	it('formats a date as the local calendar day', () => {
		expect(toDateInputValue(new Date(2026, 7, 12, 23, 30))).toBe('2026-08-12');
	});
});

describe('canSubmitObservation', () => {
	it('accepts a hand-written observation with a species and a date', () => {
		expect(canSubmitObservation(draftWith())).toBe(true);
	});

	it('rejects a missing species', () => {
		expect(canSubmitObservation(draftWith({ species: '   ' }))).toBe(false);
	});

	it('rejects a missing date', () => {
		expect(canSubmitObservation(draftWith({ observedOn: '' }))).toBe(false);
	});

	it('rejects a photo identification with nothing captured', () => {
		expect(canSubmitObservation(draftWith({ method: 'photo' }))).toBe(false);
	});

	it('accepts a photo identification once a picture is captured', () => {
		expect(canSubmitObservation(draftWith({ method: 'photo', capture: anyCapture }))).toBe(true);
	});

	it('rejects a sound identification with nothing captured', () => {
		expect(canSubmitObservation(draftWith({ method: 'sound' }))).toBe(false);
	});

	it('accepts a sound identification once a recording is captured', () => {
		expect(canSubmitObservation(draftWith({ method: 'sound', capture: anyCapture }))).toBe(true);
	});
});
