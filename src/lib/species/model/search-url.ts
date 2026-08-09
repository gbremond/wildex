import { HABITATS, STATUSES } from './model';
import { IUCN_FILTER_VALUES, type SpeciesFilters } from './filters';

const QUERY_KEY = 'q';

function keepKnown<Value extends string>(known: readonly Value[], values: string[]): Value[] {
	return values.filter((value): value is Value => known.includes(value as Value));
}

function appendAll(params: URLSearchParams, key: string, values: string[]) {
	values.forEach((value) => params.append(key, value));
}

export function readSearchParams(params: URLSearchParams): {
	query: string;
	filters: SpeciesFilters;
} {
	return {
		query: params.get(QUERY_KEY) ?? '',
		filters: {
			status: keepKnown(STATUSES, params.getAll('status')),
			order: params.getAll('order'),
			habitat: keepKnown(HABITATS, params.getAll('habitat')),
			iucn: keepKnown(IUCN_FILTER_VALUES, params.getAll('iucn'))
		}
	};
}

export function toSearchPath(query: string, filters: SpeciesFilters): '/' | `/?${string}` {
	const params = new URLSearchParams();

	if (query) params.set(QUERY_KEY, query);
	appendAll(params, 'status', filters.status);
	appendAll(params, 'order', filters.order);
	appendAll(params, 'habitat', filters.habitat);
	appendAll(params, 'iucn', filters.iucn);

	const search = params.toString();

	return search ? `/?${search}` : '/';
}
