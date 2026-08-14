export type Species = {
	scientific: string;
	common: string;
	score: number;
};

function sigmoid(x: number): number {
	return 1 / (1 + Math.exp(-x));
}

/**
 * The audio model emits raw logits per chunk. A bird only has to call once, so
 * a species is scored by its best chunk rather than its average.
 */
export function peakScores(logits: Float32Array, speciesCount: number): Float32Array {
	const scores = new Float32Array(speciesCount);
	const chunks = Math.floor(logits.length / speciesCount);

	for (let chunk = 0; chunk < chunks; chunk++) {
		const offset = chunk * speciesCount;
		for (let species = 0; species < speciesCount; species++) {
			const score = sigmoid(logits[offset + species]);
			if (score > scores[species]) scores[species] = score;
		}
	}

	return scores;
}

/** Drops species the geo model does not expect at this location and week. */
export function gateByPrior(
	scores: Float32Array,
	prior: Float32Array,
	threshold: number
): Float32Array {
	return scores.map((score, species) => (prior[species] > threshold ? score : 0));
}

export function parseLabel(label: string): { scientific: string; common: string } {
	const separator = label.indexOf('_');
	return {
		scientific: label.slice(0, separator),
		common: label.slice(separator + 1)
	};
}

export function topSpecies(scores: Float32Array, labels: string[], limit: number): Species[] {
	return Array.from(scores, (score, index) => ({ ...parseLabel(labels[index]), score }))
		.filter((species) => species.score > 0)
		.sort((a, b) => b.score - a.score)
		.slice(0, limit);
}
