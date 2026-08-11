export type NavTab = 'home' | 'observations' | 'games' | 'downloads';

// A species page is reached from the search, so it keeps the home tab lit.
const TAB_ROUTES: Record<NavTab, string[]> = {
	home: ['/', '/species/[id]'],
	observations: ['/observations'],
	games: ['/games'],
	downloads: ['/downloads']
};

export function isTabActive(routeId: string | null, tab: NavTab): boolean {
	return TAB_ROUTES[tab].includes(routeId ?? '');
}
