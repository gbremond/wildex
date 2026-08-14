import { describe, expect, it } from 'vitest';
import { gateByPrior, parseLabel, peakScores, topSpecies } from './predictions';

describe('peakScores', () => {
	it('turns the raw logits the model emits into probabilities', () => {
		const scores = peakScores(new Float32Array([0]), 1);

		expect(scores[0]).toBeCloseTo(0.5, 5);
	});

	it('keeps each species at its loudest moment across the recording', () => {
		// two chunks, two species: species 0 peaks in the second chunk
		const logits = new Float32Array([-4, 4, 4, -4]);

		const scores = peakScores(logits, 2);

		expect(scores[0]).toBeCloseTo(0.982, 3);
		expect(scores[1]).toBeCloseTo(0.982, 3);
	});

	it('scores nothing when the recording produced no chunk', () => {
		expect(peakScores(new Float32Array(0), 2)).toHaveLength(2);
	});
});

describe('gateByPrior', () => {
	it('silences species the geo model does not expect here and now', () => {
		const gated = gateByPrior(new Float32Array([0.9, 0.9]), new Float32Array([0.5, 0.01]), 0.03);

		expect(gated[0]).toBeCloseTo(0.9, 5);
		expect(gated[1]).toBe(0);
	});

	it('keeps a species sitting exactly on the threshold out', () => {
		const gated = gateByPrior(new Float32Array([0.9]), new Float32Array([0.03]), 0.03);

		expect(gated[0]).toBe(0);
	});
});

describe('parseLabel', () => {
	it('splits the scientific name from the common name', () => {
		expect(parseLabel('Turdus merula_Eurasian Blackbird')).toEqual({
			scientific: 'Turdus merula',
			common: 'Eurasian Blackbird'
		});
	});

	it('keeps underscores that belong to the common name', () => {
		expect(parseLabel('Genus species_A_B')).toEqual({
			scientific: 'Genus species',
			common: 'A_B'
		});
	});
});

describe('topSpecies', () => {
	const labels = ['A a_Alpha', 'B b_Beta', 'C c_Gamma'];

	it('ranks the most confident species first', () => {
		const top = topSpecies(new Float32Array([0.1, 0.9, 0.5]), labels, 3);

		expect(top.map((s) => s.common)).toEqual(['Beta', 'Gamma', 'Alpha']);
	});

	it('returns at most the requested number of species', () => {
		expect(topSpecies(new Float32Array([0.1, 0.9, 0.5]), labels, 2)).toHaveLength(2);
	});

	it('leaves out species the geo gate silenced', () => {
		const top = topSpecies(new Float32Array([0, 0.9, 0]), labels, 3);

		expect(top.map((s) => s.common)).toEqual(['Beta']);
	});
});
