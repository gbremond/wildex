import { describe, expect, it } from 'vitest';
import { readObservationFilter, toObservationsPath } from './filter-url';

describe('observation filter in the URL', () => {
	it('round-trips a species and a trip', () => {
		const filter = { speciesId: '3571', tripId: 'teich' };

		const path = toObservationsPath(filter);
		const read = readObservationFilter(new URLSearchParams(path.split('?')[1]));

		expect(read).toEqual(filter);
	});

	it('is the bare page when nothing is filtered', () => {
		expect(toObservationsPath({})).toBe('/observations');
	});

	it('reads a missing parameter as no filter', () => {
		expect(readObservationFilter(new URLSearchParams('trip=teich'))).toEqual({ tripId: 'teich' });
	});
});
