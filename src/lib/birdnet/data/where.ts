import { currentPosition } from '$lib/geolocation';
import type { Where } from '../model/session';
import { birdnetWeek } from '../model/week';

export async function whereNow(): Promise<Where | null> {
	const position = await currentPosition();
	return position && { ...position, week: birdnetWeek(new Date()) };
}
