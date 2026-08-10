import {
	HABITATS,
	IUCN_CATEGORIES,
	STATUSES,
	type Habitat,
	type IucnCategory,
	type Status
} from '../model/model';
import { readableLabel } from './labels';

export type FacetOption<Value extends string = string> = { value: Value; label: string };

function toOption<Value extends Habitat | Status | IucnCategory>(value: Value): FacetOption<Value> {
	return { value, label: readableLabel(value) };
}

export const STATUS_OPTIONS: FacetOption<Status>[] = STATUSES.map(toOption);

export const HABITAT_OPTIONS: FacetOption<Habitat>[] = HABITATS.map(toOption);

export const IUCN_OPTIONS: FacetOption<IucnCategory>[] = IUCN_CATEGORIES.map(toOption);

// Orders are already written as readable names by the source.
export function toOrderOptions(orders: string[]): FacetOption[] {
	return orders.map((order) => ({ value: order, label: order }));
}
