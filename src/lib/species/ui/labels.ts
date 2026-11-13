import { m } from '$lib/paraglide/messages';
import type { Habitat, IucnCategory, Status } from '../model/model';

const HABITAT_LABELS: Record<Habitat, () => string> = {
	MARINE: m.habitat_marine,
	FRESHWATER: m.habitat_freshwater,
	TERRESTRIAL: m.habitat_terrestrial,
	MARINE_AND_FRESHWATER: m.habitat_marine_and_freshwater,
	MARINE_AND_TERRESTRIAL: m.habitat_marine_and_terrestrial,
	BRACKISH: m.habitat_brackish,
	CONTINENTAL: m.habitat_continental,
	TERRESTRIAL_AND_FRESHWATER: m.habitat_terrestrial_and_freshwater
};

const STATUS_LABELS: Record<Status, () => string> = {
	NATIVE: m.status_native,
	ENDEMIC: m.status_endemic,
	SUBENDEMIC: m.status_subendemic,
	INTRODUCED: m.status_introduced,
	INVASIVE: m.status_invasive,
	OCCASIONAL: m.status_occasional
};

const IUCN_LABELS: Record<IucnCategory, () => string> = {
	LEAST_CONCERN: m.iucn_least_concern,
	NEAR_THREATENED: m.iucn_near_threatened,
	VULNERABLE: m.iucn_vulnerable,
	ENDANGERED: m.iucn_endangered,
	CRITICALLY_ENDANGERED: m.iucn_critically_endangered,
	EXTINCT_IN_THE_WILD: m.iucn_extinct_in_the_wild,
	EXTINCT: m.iucn_extinct,
	DATA_DEFICIENT: m.iucn_data_deficient,
	UNKNOWN: m.iucn_unknown
};

export function habitatLabel(habitat: Habitat): string {
	return HABITAT_LABELS[habitat]();
}

export function statusLabel(status: Status): string {
	return STATUS_LABELS[status]();
}

export function iucnLabel(category: IucnCategory): string {
	return IUCN_LABELS[category]();
}
