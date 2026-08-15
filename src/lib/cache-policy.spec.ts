import { describe, it, expect } from 'vitest';
import { isObsoleteCache, toCachePolicy } from './cache-policy';
import { SPECIES_IMAGE_CACHE } from './species/data/image';
import { BIRDNET_CACHE } from './birdnet/data/models';

const CURRENT_APP_CACHE = 'cache-abc123';

describe('isObsoleteCache', () => {
	it('keeps the app shell of the running version', () => {
		expect(isObsoleteCache(CURRENT_APP_CACHE, CURRENT_APP_CACHE)).toBe(false);
	});

	it('deletes the app shell of a previous version', () => {
		expect(isObsoleteCache('cache-old999', CURRENT_APP_CACHE)).toBe(true);
	});

	it('keeps downloaded bird images across a deployment', () => {
		expect(isObsoleteCache(SPECIES_IMAGE_CACHE, CURRENT_APP_CACHE)).toBe(false);
	});

	it('keeps the downloaded models across a deployment', () => {
		expect(isObsoleteCache(BIRDNET_CACHE, CURRENT_APP_CACHE)).toBe(false);
	});

	it('deletes a cache left over from an earlier implementation', () => {
		expect(isObsoleteCache('bird-images-v0', CURRENT_APP_CACHE)).toBe(true);
	});
});

const BUILD = ['/wildex/_app/immutable/entry/app.Ben4I.js'];
const FILES = [
	'/wildex/birds.json',
	'/wildex/.nojekyll',
	'/wildex/models/birdnet/model.onnx',
	'/wildex/models/birdnet/labels.txt',
	'/wildex/ort/ort-wasm-simd-threaded.jsep.wasm'
];
const PRERENDERED = ['/wildex/', '/wildex/downloads'];

describe('toCachePolicy', () => {
	const { precache, cacheFirst } = toCachePolicy(BUILD, FILES, PRERENDERED);

	it('precaches the prerendered pages so navigations work offline', () => {
		expect(precache).toEqual(expect.arrayContaining(PRERENDERED));
	});

	it('precaches the hashed build output and the static files', () => {
		expect(precache).toEqual(expect.arrayContaining(['/wildex/birds.json', ...BUILD]));
	});

	// A stale page names the hashed assets of the deployment that produced it, so serving
	// one from cache pins the whole app to that deployment until the worker is replaced.
	it('never serves a prerendered page from cache without checking the network', () => {
		PRERENDERED.forEach((page) => expect(cacheFirst).not.toContain(page));
	});

	it('serves the hashed build output from cache', () => {
		expect(cacheFirst).toEqual(expect.arrayContaining(BUILD));
	});

	it('serves the static files from cache', () => {
		expect(cacheFirst).toContain('/wildex/birds.json');
	});

	it('never caches .nojekyll, which GitHub Pages refuses to serve', () => {
		expect(precache).not.toContain('/wildex/.nojekyll');
		expect(cacheFirst).not.toContain('/wildex/.nojekyll');
	});

	// 100 MB through a single atomic addAll would make every install and every
	// deployment re-download the lot, and one failed request would reject it all.
	it('never precaches the identification models', () => {
		expect(precache).not.toContain('/wildex/models/birdnet/model.onnx');
		expect(precache).not.toContain('/wildex/models/birdnet/labels.txt');
	});

	it('never precaches the inference runtime', () => {
		expect(precache).not.toContain('/wildex/ort/ort-wasm-simd-threaded.jsep.wasm');
	});
});
