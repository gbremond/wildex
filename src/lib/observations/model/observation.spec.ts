import { describe, expect, it } from 'vitest';
import {
	filterObservations,
	groupByDay,
	observedSpeciesFrom,
	photoOf,
	type Observation
} from './observation';
import type { Species } from '$lib/species/model/model';

const kingfisher = { name: 'Martin-pêcheur', speciesId: '3571', scientificName: 'Alcedo atthis' };
const egret = { name: 'Aigrette garzette', speciesId: '2622', scientificName: 'Egretta garzetta' };

function observation(overrides: Partial<Observation> = {}): Observation {
	return {
		id: crypto.randomUUID(),
		species: kingfisher,
		observedAt: new Date(2026, 10, 13, 9, 0).toISOString(),
		position: null,
		tripId: null,
		method: 'manual',
		notes: '',
		capture: null,
		...overrides
	};
}

const at = (hours: number, day = 13) => new Date(2026, 10, day, hours, 0).toISOString();

describe('filterObservations', () => {
	it('keeps only the observations of one species', () => {
		const seen = [observation({ species: kingfisher }), observation({ species: egret })];

		const found = filterObservations(seen, { speciesId: egret.speciesId });

		expect(found.map((o) => o.species)).toEqual([egret]);
	});

	it('keeps only the observations of one trip', () => {
		const seen = [observation({ tripId: 'teich' }), observation()];

		expect(filterObservations(seen, { tripId: 'teich' })).toHaveLength(1);
	});

	it('lists the most recent observation first', () => {
		const morning = observation({ observedAt: at(8) });
		const evening = observation({ observedAt: at(18) });

		expect(filterObservations([morning, evening], {})).toEqual([evening, morning]);
	});
});

describe('groupByDay', () => {
	it('puts a late-evening observation on its local day', () => {
		const lateEvening = observation({ observedAt: at(23.5) });

		expect(groupByDay([lateEvening])[0].day).toBe('2026-11-13');
	});

	it('lists the most recent day first, with its observations together', () => {
		const days = groupByDay([
			observation({ observedAt: at(9, 12) }),
			observation({ observedAt: at(9, 13) }),
			observation({ observedAt: at(15, 13) })
		]);

		expect(days.map(({ day, observations }) => [day, observations.length])).toEqual([
			['2026-11-13', 2],
			['2026-11-12', 1]
		]);
	});
});

describe('photoOf', () => {
	it('shows the attached picture', () => {
		const picture = new Blob([], { type: 'image/jpeg' });

		expect(photoOf(observation({ capture: picture }))).toEqual({ kind: 'capture', blob: picture });
	});

	it('falls back to the species picture when nothing is attached', () => {
		expect(photoOf(observation())).toEqual({ kind: 'species', scientificName: 'Alcedo atthis' });
	});

	it('falls back to the species picture when the capture is a recording', () => {
		const recording = new Blob([], { type: 'audio/wav' });

		expect(photoOf(observation({ capture: recording }))).toEqual({
			kind: 'species',
			scientificName: 'Alcedo atthis'
		});
	});

	it('has no picture for an unlisted species named by hand', () => {
		expect(photoOf(observation({ species: { name: 'Some odd gull' } }))).toEqual({ kind: 'none' });
	});
});

describe('observedSpeciesFrom', () => {
	it('names a listed species by its French name and keeps its id', () => {
		const species = {
			id: '3571',
			scientificName: 'Alcedo atthis',
			frenchName: 'Martin-pêcheur',
			englishName: 'Common Kingfisher'
		} as Species;

		expect(observedSpeciesFrom(species)).toEqual(kingfisher);
	});
});
