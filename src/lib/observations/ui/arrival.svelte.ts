import type { Observation } from '../model/observation';

// Long enough for the sheet to slide away and the rows to drop in.
const ARRIVAL_MS = 1500;

let arrivedIds = $state.raw<string[]>([]);

/**
 * Called once the save sheet has closed: the lists and the nav bar then show
 * where the new observations went.
 */
export function announceArrival(observations: Observation[]): void {
	const ids = observations.map(({ id }) => id);
	arrivedIds = ids;
	setTimeout(() => {
		if (arrivedIds === ids) arrivedIds = [];
	}, ARRIVAL_MS);
}

export function hasJustArrived({ id }: Observation): boolean {
	return arrivedIds.includes(id);
}

/** Changes on every announcement, so a keyed block can replay its animation. */
export function latestArrival(): string[] {
	return arrivedIds;
}

/** Waits for the sheet to slide away, or the drop plays under it. */
export const ARRIVE_CLASS =
	'animate-in fade-in slide-in-from-top-2 delay-350 duration-450 fill-mode-backwards motion-reduce:animate-none';
