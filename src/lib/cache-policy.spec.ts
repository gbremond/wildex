import { describe, it, expect } from 'vitest';
import { isObsoleteCache } from './cache-policy';
import { SPECIES_IMAGE_CACHE } from './species/data/image';

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

	it('deletes a cache left over from an earlier implementation', () => {
		expect(isObsoleteCache('bird-images-v0', CURRENT_APP_CACHE)).toBe(true);
	});
});
