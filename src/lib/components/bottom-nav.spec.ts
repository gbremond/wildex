import { describe, it, expect } from 'vitest';
import { isTabActive, type NavTab } from './bottom-nav';

const TABS: NavTab[] = ['home', 'observations', 'games', 'downloads'];

function litTabs(routeId: string | null) {
	return TABS.filter((tab) => isTabActive(routeId, tab));
}

describe('isTabActive', () => {
	it('lights the home tab on the search page', () => {
		expect(litTabs('/')).toEqual(['home']);
	});

	it('lights the home tab on a species page', () => {
		expect(litTabs('/species/[id]')).toEqual(['home']);
	});

	it('lights the observations tab on the observations page', () => {
		expect(litTabs('/observations')).toEqual(['observations']);
	});

	it('lights the games tab on the games page', () => {
		expect(litTabs('/games')).toEqual(['games']);
	});

	it('lights the downloads tab on the downloads page', () => {
		expect(litTabs('/downloads')).toEqual(['downloads']);
	});

	it('lights nothing on an unmatched route', () => {
		expect(litTabs(null)).toEqual([]);
	});
});
