import { describe, expect, it } from 'vitest';
import { birdnetWeek } from './week';

describe('birdnetWeek', () => {
	it('starts the year at week 1', () => {
		expect(birdnetWeek(new Date('2026-01-01T12:00:00'))).toBe(1);
	});

	it('ends the year at week 48', () => {
		expect(birdnetWeek(new Date('2026-12-31T12:00:00'))).toBe(48);
	});

	it('gives every month exactly four weeks', () => {
		expect(birdnetWeek(new Date('2026-02-01T12:00:00'))).toBe(5);
	});

	it('clamps the tail of a long month into its fourth week', () => {
		expect(birdnetWeek(new Date('2026-01-29T12:00:00'))).toBe(4);
		expect(birdnetWeek(new Date('2026-01-31T12:00:00'))).toBe(4);
	});

	it('never leaves the 1..48 range the geo model accepts', () => {
		const day = new Date('2026-01-01T12:00:00');
		const weeks: number[] = [];
		while (day.getFullYear() === 2026) {
			weeks.push(birdnetWeek(new Date(day)));
			day.setDate(day.getDate() + 1);
		}

		expect(weeks).toHaveLength(365);
		expect(Math.min(...weeks)).toBe(1);
		expect(Math.max(...weeks)).toBe(48);
	});

	it('increases monotonically through the year', () => {
		const day = new Date('2026-01-01T12:00:00');
		let previous = 0;
		while (day.getFullYear() === 2026) {
			const week = birdnetWeek(new Date(day));
			expect(week).toBeGreaterThanOrEqual(previous);
			previous = week;
			day.setDate(day.getDate() + 1);
		}
	});
});
