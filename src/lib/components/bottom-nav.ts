export type NavTab = 'home' | 'downloads';

// A species page is reached from the search, so it keeps the home tab lit.
const HOME_ROUTES = ['/', '/species/[id]'];

export function isTabActive(routeId: string | null, tab: NavTab): boolean {
	if (tab === 'downloads') return routeId === '/downloads';

	return HOME_ROUTES.includes(routeId ?? '');
}
