import { HABITATS, IUCN_CATEGORIES, STATUSES } from './model';
import type { SpeciesFilters } from './filters';

const QUERY_KEY = 'q';
const AROUND_KEY = 'around';
const AROUND_ME = 'me';

function keepKnown<Value extends string>(known: readonly Value[], values: string[]): Value[] {
	return values.filter((value): value is Value => known.includes(value as Value));
}

function appendAll(params: URLSearchParams, key: string, values: string[]) {
	values.forEach((value) => params.append(key, value));
}

export function readSearchParams(params: URLSearchParams): {
	query: string;
	filters: SpeciesFilters;
	aroundMe: boolean;
} {
	return {
		query: params.get(QUERY_KEY) ?? '',
		filters: {
			status: keepKnown(STATUSES, params.getAll('status')),
			order: params.getAll('order'),
			habitat: keepKnown(HABITATS, params.getAll('habitat')),
			iucn: keepKnown(IUCN_CATEGORIES, params.getAll('iucn'))
		},
		aroundMe: params.get(AROUND_KEY) === AROUND_ME
	};
}

export function toSearchPath(
	query: string,
	filters: SpeciesFilters,
	aroundMe = false
): '/' | `/?${string}` {
	const params = new URLSearchParams();

	if (query) params.set(QUERY_KEY, query);
	if (aroundMe) params.set(AROUND_KEY, AROUND_ME);
	appendAll(params, 'status', filters.status);
	appendAll(params, 'order', filters.order);
	appendAll(params, 'habitat', filters.habitat);
	appendAll(params, 'iucn', filters.iucn);

	const search = params.toString();

	return search ? `/?${search}` : '/';
}
