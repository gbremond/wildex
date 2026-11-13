import { likelihoodsFrom, type Likelihoods } from '../model/likely';
import { loadBirdnet } from '../model/session';
import { isBirdnetDownloaded } from './model-cache';
import { whereNow } from './where';

export type LikelySpeciesHere =
	| { kind: 'not-downloaded' }
	| { kind: 'no-position' }
	| { kind: 'unavailable' }
	| { kind: 'found'; likelihoods: Likelihoods };

export async function findLikelySpeciesHere(): Promise<LikelySpeciesHere> {
	if (!(await isBirdnetDownloaded())) return { kind: 'not-downloaded' };

	const where = await whereNow();
	if (!where) return { kind: 'no-position' };

	const birdnet = await loadBirdnet();
	const prior = await birdnet.prior(where);

	return { kind: 'found', likelihoods: likelihoodsFrom(prior, birdnet.speciesLabels) };
}
