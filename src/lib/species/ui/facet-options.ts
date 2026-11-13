import {
	HABITATS,
	IUCN_CATEGORIES,
	STATUSES,
	type Habitat,
	type IucnCategory,
	type Status
} from '../model/model';
import { habitatLabel, iucnLabel, statusLabel } from './labels';

export type FacetOption<Value extends string = string> = { value: Value; label: string };

export function statusOptions(): FacetOption<Status>[] {
	return STATUSES.map((value) => ({ value, label: statusLabel(value) }));
}

export function habitatOptions(): FacetOption<Habitat>[] {
	return HABITATS.map((value) => ({ value, label: habitatLabel(value) }));
}

export function iucnOptions(): FacetOption<IucnCategory>[] {
	return IUCN_CATEGORIES.map((value) => ({ value, label: iucnLabel(value) }));
}

// Orders are already written as readable names by the source.
export function toOrderOptions(orders: string[]): FacetOption[] {
	return orders.map((order) => ({ value: order, label: order }));
}
