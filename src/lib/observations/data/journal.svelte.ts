import type { Observation } from '../model/observation';
import { activeTrip, type Trip } from '../model/trip';
import { readAll, remove, writeAll } from './database';

/** Every observation and trip on this device, kept in memory once loaded. */
class Journal {
	observations = $state<Observation[]>([]);
	trips = $state<Trip[]>([]);
	loaded = $state(false);
	activeTrip = $derived(activeTrip(this.trips));

	private loading: Promise<void> | undefined;

	load(): Promise<void> {
		this.loading ??= Promise.all([readAll('observations'), readAll('trips')]).then(
			([observations, trips]) => {
				this.observations = observations;
				this.trips = trips;
				this.loaded = true;
			}
		);
		return this.loading;
	}

	async add(observations: Observation[]) {
		await writeAll('observations', observations);
		this.observations = [...this.observations, ...observations];
	}

	async remove({ id }: Observation) {
		await remove('observations', id);
		this.observations = this.observations.filter((observation) => observation.id !== id);
	}

	/** Only one trip runs at a time, so opening a new one ends the current one. */
	async addTrip(trip: Trip) {
		if (trip.endedAt === null) await this.endTrip();

		await writeAll('trips', [trip]);
		this.trips = [...this.trips, trip];
	}

	async endTrip() {
		const ongoing = this.activeTrip;
		if (!ongoing) return;

		const ended = { ...ongoing, endedAt: new Date().toISOString() };
		await writeAll('trips', [ended]);
		this.trips = this.trips.map((trip) => (trip.id === ended.id ? ended : trip));
	}

	tripName(id: string | null): string | undefined {
		return this.trips.find((trip) => trip.id === id)?.name;
	}
}

export const journal = new Journal();
