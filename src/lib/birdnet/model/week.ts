const WEEKS_PER_MONTH = 4;

/**
 * BirdNET's geo model counts four weeks per month, so the year runs 1..48.
 * Feeding it an ISO week (1..52) silently widens the range prediction instead
 * of failing, so callers must go through here.
 */
export function birdnetWeek(date: Date): number {
	const weekInMonth = Math.min(Math.ceil(date.getDate() / 7.25), WEEKS_PER_MONTH);
	return date.getMonth() * WEEKS_PER_MONTH + weekInMonth;
}
