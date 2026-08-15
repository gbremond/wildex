import { canSubmitObservations, toObservations } from './draft';
import { describe, expect, it } from 'vitest';

const wav = (name: string) => new File([new ArrayBuffer(8)], name, { type: 'audio/wav' });
const shared = { method: 'sound' as const, observedOn: '2026-08-15', notes: 'dawn chorus' };

describe('toObservations', () => {
	it('makes one observation per species heard', () => {
		const drafts = toObservations(shared, [
			{ species: 'Eurasian Blackbird', capture: wav('a.wav') },
			{ species: 'Great Tit', capture: wav('b.wav') }
		]);

		expect(drafts.map((draft) => draft.species)).toEqual(['Eurasian Blackbird', 'Great Tit']);
	});

	it('gives each observation the recording that identified it', () => {
		const blackbird = wav('blackbird.wav');
		const tit = wav('tit.wav');

		const drafts = toObservations(shared, [
			{ species: 'Eurasian Blackbird', capture: blackbird },
			{ species: 'Great Tit', capture: tit }
		]);

		expect(drafts[0].capture).toBe(blackbird);
		expect(drafts[1].capture).toBe(tit);
	});

	it('repeats the date and notes across every observation', () => {
		const drafts = toObservations(shared, [
			{ species: 'A', capture: wav('a.wav') },
			{ species: 'B', capture: wav('b.wav') }
		]);

		expect(drafts.every((d) => d.observedOn === '2026-08-15' && d.notes === 'dawn chorus')).toBe(
			true
		);
	});

	it('yields nothing when no species was selected', () => {
		expect(toObservations(shared, [])).toEqual([]);
	});
});

describe('canSubmitObservations', () => {
	it('refuses an empty batch', () => {
		expect(canSubmitObservations([])).toBe(false);
	});

	it('accepts a batch where every observation is complete', () => {
		const drafts = toObservations(shared, [
			{ species: 'A', capture: wav('a.wav') },
			{ species: 'B', capture: wav('b.wav') }
		]);

		expect(canSubmitObservations(drafts)).toBe(true);
	});

	it('refuses the whole batch when one observation is incomplete', () => {
		const drafts = toObservations(shared, [
			{ species: 'A', capture: wav('a.wav') },
			{ species: 'B', capture: null }
		]);

		expect(canSubmitObservations(drafts)).toBe(false);
	});
});

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
