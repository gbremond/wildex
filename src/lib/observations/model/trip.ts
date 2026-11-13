import { localDay } from '$lib/local-date';
import { matchesSearch } from '$lib/species/model/search';

export type Trip = { id: string; name: string; startedAt: string; endedAt: string | null };

/**
 * A trip on today starts now and stays open until ended. A trip on another
 * day is being filled in after the fact, so it simply covers that day.
 */
export function newTrip(name: string, day: string, now: Date): Trip {
	const id = crypto.randomUUID();

	if (day === localDay(now)) {
		return { id, name, startedAt: now.toISOString(), endedAt: null };
	}

	const [year, month, date] = day.split('-').map(Number);
	return {
		id,
		name,
		startedAt: new Date(year, month - 1, date).toISOString(),
		endedAt: new Date(year, month - 1, date, 23, 59, 59, 999).toISOString()
	};
}

export function activeTrip(trips: Trip[]): Trip | undefined {
	return trips.find((trip) => trip.endedAt === null);
}

function covers(trip: Trip, moment: string): boolean {
	return trip.startedAt <= moment && (trip.endedAt === null || moment <= trip.endedAt);
}

export function tripAt(trips: Trip[], moment: string): Trip | undefined {
	return newestFirst(trips).find((trip) => covers(trip, moment));
}

export function newestFirst(trips: Trip[]): Trip[] {
	return trips.toSorted((a, b) => b.startedAt.localeCompare(a.startedAt));
}

/** The latest trips, plus the one filtering the page so it never drops out of view. */
export function tripChips(
	trips: Trip[],
	selectedTripId: string | undefined,
	limit: number
): Trip[] {
	const sorted = newestFirst(trips);
	const recent = sorted.slice(0, limit);
	const selected = sorted.find((trip) => trip.id === selectedTripId);

	return selected && !recent.includes(selected) ? [...recent, selected] : recent;
}

export function groupByYear(trips: Trip[]): { year: number; trips: Trip[] }[] {
	const years = new Map<number, Trip[]>();

	for (const trip of newestFirst(trips)) {
		const year = new Date(trip.startedAt).getFullYear();
		years.set(year, [...(years.get(year) ?? []), trip]);
	}

	return [...years].map(([year, trips]) => ({ year, trips }));
}

export function searchTrips(trips: Trip[], query: string): Trip[] {
	return trips.filter((trip) => matchesSearch(trip.name, query));
}
