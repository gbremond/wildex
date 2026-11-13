import { describe, expect, it } from 'vitest';
import {
	activeTrip,
	groupByYear,
	newTrip,
	searchTrips,
	tripAt,
	tripChips,
	type Trip
} from './trip';

const november = (day: number, hours = 0, minutes = 0) => new Date(2026, 10, day, hours, minutes);

function trip(overrides: Partial<Trip> = {}): Trip {
	return {
		id: crypto.randomUUID(),
		name: 'Réserve ornithologique du Teich',
		startedAt: november(13, 8).toISOString(),
		endedAt: null,
		...overrides
	};
}

describe('newTrip', () => {
	const now = november(13, 9, 30);

	it('starts a trip on today right now, and keeps it open', () => {
		const today = newTrip('Teich', '2026-11-13', now);

		expect(today).toMatchObject({ startedAt: now.toISOString(), endedAt: null });
	});

	it('makes a trip on a past day cover that whole day', () => {
		const past = newTrip('Teich', '2026-11-11', now);

		expect(past.startedAt).toBe(november(11).toISOString());
		expect(past.endedAt).toBe(new Date(2026, 10, 11, 23, 59, 59, 999).toISOString());
	});
});

describe('activeTrip', () => {
	it('is the trip that has not ended yet', () => {
		const ongoing = trip();

		expect(activeTrip([trip({ endedAt: november(12, 17).toISOString() }), ongoing])).toBe(ongoing);
	});

	it('is nothing when every trip has ended', () => {
		expect(activeTrip([trip({ endedAt: november(13, 17).toISOString() })])).toBeUndefined();
	});
});

describe('tripAt', () => {
	const pastTrip = newTrip('Teich', '2026-11-11', november(13));

	it('finds the past trip an observation was made on', () => {
		expect(tripAt([pastTrip], november(11, 15).toISOString())).toBe(pastTrip);
	});

	it('finds nothing outside every trip', () => {
		expect(tripAt([pastTrip], november(12, 9).toISOString())).toBeUndefined();
	});

	it('finds the ongoing trip for an observation made since it started', () => {
		const ongoing = trip({ startedAt: november(13, 8).toISOString() });

		expect(tripAt([pastTrip, ongoing], november(13, 10).toISOString())).toBe(ongoing);
	});

	it('prefers the trip started last when two overlap', () => {
		const dayTrip = newTrip('Bassin', '2026-11-13', november(14));
		const afternoon = trip({ startedAt: november(13, 14).toISOString() });

		expect(tripAt([dayTrip, afternoon], november(13, 15).toISOString())).toBe(afternoon);
	});
});

describe('tripChips', () => {
	const onDay = (name: string, day: number, month = 10) =>
		trip({ name, startedAt: new Date(2026, month, day).toISOString() });
	const trips = [
		onDay('Arcachon', 11),
		onDay('Teich', 13),
		onDay('Ferret', 2),
		onDay('Camargue', 5, 4)
	];

	it('keeps the most recent trips, newest first', () => {
		expect(tripChips(trips, undefined, 3).map(({ name }) => name)).toEqual([
			'Teich',
			'Arcachon',
			'Ferret'
		]);
	});

	it('keeps an older trip in view while it filters the page', () => {
		const camargue = trips[3];

		expect(tripChips(trips, camargue.id, 3).map(({ name }) => name)).toEqual([
			'Teich',
			'Arcachon',
			'Ferret',
			'Camargue'
		]);
	});
});

describe('groupByYear', () => {
	it('groups trips by the year they started, newest year and trip first', () => {
		const camargue = trip({ name: 'Camargue', startedAt: new Date(2025, 4, 12).toISOString() });
		const teich = trip({ name: 'Teich', startedAt: november(13).toISOString() });
		const arcachon = trip({ name: 'Arcachon', startedAt: november(11).toISOString() });

		expect(groupByYear([camargue, arcachon, teich])).toEqual([
			{ year: 2026, trips: [teich, arcachon] },
			{ year: 2025, trips: [camargue] }
		]);
	});
});

describe('searchTrips', () => {
	const teich = trip({ name: 'Réserve ornithologique du Teich' });
	const camargue = trip({ name: 'Camargue' });

	it('finds a trip by any word of its name, ignoring accents and case', () => {
		expect(searchTrips([teich, camargue], 'reserve')).toEqual([teich]);
	});

	it('keeps every trip while nothing is typed', () => {
		expect(searchTrips([teich, camargue], '  ')).toEqual([teich, camargue]);
	});
});
