import { describe, it, expect } from 'vitest';
import { iucnBadgeVariant, iucnIcon, statusBadgeVariant } from './badge-variants';
import { IUCN_CATEGORIES, STATUSES } from '../model/model';

describe('statusBadgeVariant', () => {
	it('maps the naturally occurring statuses to success', () => {
		expect(statusBadgeVariant('NATIVE')).toBe('success');
		expect(statusBadgeVariant('ENDEMIC')).toBe('success');
		expect(statusBadgeVariant('SUBENDEMIC')).toBe('success');
	});

	it('maps introduced and occasional to warning', () => {
		expect(statusBadgeVariant('INTRODUCED')).toBe('warning');
		expect(statusBadgeVariant('OCCASIONAL')).toBe('warning');
	});

	it('maps invasive to destructive', () => {
		expect(statusBadgeVariant('INVASIVE')).toBe('destructive');
	});

	it('covers every status', () => {
		expect(STATUSES.every((status) => statusBadgeVariant(status))).toBe(true);
	});
});

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
