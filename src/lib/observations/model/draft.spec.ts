import { describe, expect, it } from 'vitest';
import {
	canSubmitObservation,
	canSubmitObservations,
	toObservation,
	toObservations,
	wasSeenJustNow,
	type ObservationDraft
} from './draft';

const wav = (name: string) => new File([new ArrayBuffer(8)], name, { type: 'audio/wav' });
const shared = { method: 'sound' as const, observedAt: '2026-08-15T06:30', notes: 'dawn chorus' };
const named = (name: string) => ({ name });

describe('toObservations', () => {
	it('makes one observation per species heard', () => {
		const drafts = toObservations(shared, [
			{ species: named('Eurasian Blackbird'), capture: wav('a.wav') },
			{ species: named('Great Tit'), capture: wav('b.wav') }
		]);

		expect(drafts.map((draft) => draft.species.name)).toEqual(['Eurasian Blackbird', 'Great Tit']);
	});

	it('gives each observation the recording that identified it', () => {
		const blackbird = wav('blackbird.wav');
		const tit = wav('tit.wav');

		const drafts = toObservations(shared, [
			{ species: named('Eurasian Blackbird'), capture: blackbird },
			{ species: named('Great Tit'), capture: tit }
		]);

		expect(drafts[0].capture).toBe(blackbird);
		expect(drafts[1].capture).toBe(tit);
	});

	it('repeats the date and notes across every observation', () => {
		const drafts = toObservations(shared, [
			{ species: named('A'), capture: wav('a.wav') },
			{ species: named('B'), capture: wav('b.wav') }
		]);

		expect(
			drafts.every((d) => d.observedAt === '2026-08-15T06:30' && d.notes === 'dawn chorus')
		).toBe(true);
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
			{ species: named('A'), capture: wav('a.wav') },
			{ species: named('B'), capture: wav('b.wav') }
		]);

		expect(canSubmitObservations(drafts)).toBe(true);
	});

	it('refuses the whole batch when one observation is incomplete', () => {
		const drafts = toObservations(shared, [
			{ species: named('A'), capture: wav('a.wav') },
			{ species: named('B'), capture: null }
		]);

		expect(canSubmitObservations(drafts)).toBe(false);
	});
});

function draftWith(overrides: Partial<ObservationDraft> = {}): ObservationDraft {
	return {
		method: 'manual',
		species: { name: 'Common kingfisher' },
		observedAt: '2026-08-12T10:00',
		notes: '',
		capture: null,
		...overrides
	};
}

const anyCapture = new File([], 'kingfisher.jpg');

describe('toObservation', () => {
	it('stamps the draft with where and during which trip it was seen', () => {
		const position = { latitude: 44.64, longitude: -1.03 };

		const observation = toObservation(draftWith(), { position, tripId: 'teich' });

		expect(observation).toMatchObject({ position, tripId: 'teich' });
	});

	it('stores the moment it was seen as an instant', () => {
		const observation = toObservation(draftWith({ observedAt: '2026-08-12T10:00' }), {
			position: null,
			tripId: null
		});

		expect(observation.observedAt).toBe(new Date(2026, 7, 12, 10, 0).toISOString());
	});
});

describe('canSubmitObservation', () => {
	it('accepts a hand-written observation with a species and a date', () => {
		expect(canSubmitObservation(draftWith())).toBe(true);
	});

	it('rejects a missing species', () => {
		expect(canSubmitObservation(draftWith({ species: { name: '   ' } }))).toBe(false);
	});

	it('rejects a missing date', () => {
		expect(canSubmitObservation(draftWith({ observedAt: '' }))).toBe(false);
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

describe('wasSeenJustNow', () => {
	const now = new Date(2026, 10, 13, 10, 0);

	it('holds for an observation from a few minutes ago, so the current position applies', () => {
		expect(wasSeenJustNow('2026-11-13T09:45', now)).toBe(true);
	});

	it('does not hold for an observation filled in days later, made somewhere else', () => {
		expect(wasSeenJustNow('2026-11-11T15:00', now)).toBe(false);
	});
});
