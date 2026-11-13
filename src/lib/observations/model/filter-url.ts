import type { ObservationFilter } from './observation';

export function readObservationFilter(params: URLSearchParams): ObservationFilter {
	const filter: ObservationFilter = {};
	const speciesId = params.get('species');
	const tripId = params.get('trip');

	if (speciesId) filter.speciesId = speciesId;
	if (tripId) filter.tripId = tripId;

	return filter;
}

export function toObservationsPath({
	speciesId,
	tripId
}: ObservationFilter): '/observations' | `/observations?${string}` {
	const params = new URLSearchParams();

	if (speciesId) params.set('species', speciesId);
	if (tripId) params.set('trip', tripId);

	const search = params.toString();

	return search ? `/observations?${search}` : '/observations';
}
