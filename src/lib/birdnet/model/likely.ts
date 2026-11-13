import type { Species } from '$lib/species/model/model';
import { parseLabel } from './predictions';
import { PRIOR_THRESHOLD } from './session';

/** How likely each species is here this week, by scientific name. */
export type Likelihoods = Map<string, number>;

export function likelihoodsFrom(prior: Float32Array, labels: string[]): Likelihoods {
	const likelihoods: Likelihoods = new Map();

	prior.forEach((probability, index) => {
		if (probability > PRIOR_THRESHOLD) {
			likelihoods.set(parseLabel(labels[index]).scientific, probability);
		}
	});

	return likelihoods;
}

export function rankByLikelihood(species: Species[], likelihoods: Likelihoods): Species[] {
	const likelihoodOf = ({ scientificName }: Species) => likelihoods.get(scientificName) ?? 0;

	return species
		.filter((candidate) => likelihoods.has(candidate.scientificName))
		.sort((a, b) => likelihoodOf(b) - likelihoodOf(a));
}
