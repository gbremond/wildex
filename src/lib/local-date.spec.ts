import { describe, expect, it } from 'vitest';
import { localDateTime, localDay } from './local-date';

describe('localDay', () => {
	it('is the calendar day where the user is, even late in the evening', () => {
		expect(localDay(new Date(2026, 10, 13, 23, 30))).toBe('2026-11-13');
	});
});

describe('localDateTime', () => {
	it('is the local day and minute, as a datetime-local input expects', () => {
		expect(localDateTime(new Date(2026, 7, 12, 23, 30, 45))).toBe('2026-08-12T23:30');
	});
});
