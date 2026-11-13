import { describe, expect, it } from 'vitest';
import type { Species } from '$lib/species/model/model';
import { likelihoodsFrom, rankByLikelihood } from './likely';

const labels = [
	'Turdus merula_Common Blackbird',
	'Erithacus rubecula_European Robin',
	'Pica pica_Eurasian Magpie'
];

describe('likelihoodsFrom', () => {
	it('leaves out species the geo model does not expect here and now', () => {
		const likelihoods = likelihoodsFrom(new Float32Array([0.5, 0.03, 0.01]), labels);

		expect([...likelihoods]).toEqual([['Turdus merula', 0.5]]);
	});
});

describe('rankByLikelihood', () => {
	const species = (scientificName: string) => ({ scientificName }) as Species;
	const blackbird = species('Turdus merula');
	const robin = species('Erithacus rubecula');
	const flamingo = species('Phoenicopterus roseus');

	const likelihoods = new Map([
		['Turdus merula', 0.4],
		['Erithacus rubecula', 0.9]
	]);

	it('keeps only the species expected here, most likely first', () => {
		expect(rankByLikelihood([blackbird, flamingo, robin], likelihoods)).toEqual([robin, blackbird]);
	});
});
