import { describe, it, expect } from 'vitest';
import { isTabActive } from './bottom-nav';

describe('isTabActive', () => {
	it('lights the home tab on the search page', () => {
		expect(isTabActive('/', 'home')).toBe(true);
	});

	it('lights the home tab on a species page', () => {
		expect(isTabActive('/species/[id]', 'home')).toBe(true);
	});

	it('lights the downloads tab on the downloads page', () => {
		expect(isTabActive('/downloads', 'downloads')).toBe(true);
	});

	it('leaves the home tab dark on the downloads page', () => {
		expect(isTabActive('/downloads', 'home')).toBe(false);
	});

	it('leaves the downloads tab dark on a species page', () => {
		expect(isTabActive('/species/[id]', 'downloads')).toBe(false);
	});

	it('lights nothing on an unmatched route', () => {
		expect(isTabActive(null, 'home')).toBe(false);
		expect(isTabActive(null, 'downloads')).toBe(false);
	});
});
