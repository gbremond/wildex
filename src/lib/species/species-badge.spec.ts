import { describe, it, expect } from 'vitest';
import { iucnBadgeVariant, iucnIcon } from './species-badge';
import { IUCN_CATEGORIES } from './species.model';

describe('iucnBadgeVariant', () => {
	it('maps least-concern and near-threatened to success', () => {
		expect(iucnBadgeVariant('LEAST_CONCERN')).toBe('success');
		expect(iucnBadgeVariant('NEAR_THREATENED')).toBe('success');
	});

	it('maps vulnerable and endangered to warning', () => {
		expect(iucnBadgeVariant('VULNERABLE')).toBe('warning');
		expect(iucnBadgeVariant('ENDANGERED')).toBe('warning');
	});

	it('maps critically-endangered, extinct-in-the-wild and extinct to destructive', () => {
		expect(iucnBadgeVariant('CRITICALLY_ENDANGERED')).toBe('destructive');
		expect(iucnBadgeVariant('EXTINCT_IN_THE_WILD')).toBe('destructive');
		expect(iucnBadgeVariant('EXTINCT')).toBe('destructive');
	});

	it('maps data-deficient to secondary', () => {
		expect(iucnBadgeVariant('DATA_DEFICIENT')).toBe('secondary');
	});
});

describe('iucnIcon', () => {
	it('gives every category its own distinct icon', () => {
		const icons = IUCN_CATEGORIES.map(iucnIcon);

		expect(new Set(icons).size).toBe(IUCN_CATEGORIES.length);
	});
});
