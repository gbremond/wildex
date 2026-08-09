import { describe, it, expect } from 'vitest';
import { speciesAvatarGradient } from './avatar-gradient';

describe('speciesAvatarGradient', () => {
	it('returns the same gradient for the same seed', () => {
		expect(speciesAvatarGradient('4117')).toBe(speciesAvatarGradient('4117'));
	});

	it('returns different gradients for different seeds', () => {
		expect(speciesAvatarGradient('4117')).not.toBe(speciesAvatarGradient('3571'));
	});

	it('returns different gradients for neighbouring ids', () => {
		expect(speciesAvatarGradient('4117')).not.toBe(speciesAvatarGradient('4118'));
	});

	it('spreads hues across same-prefix ids instead of clustering by last digit', () => {
		const hues = ['4190', '4192', '4195', '4198', '4199'].map((id) => {
			const [, hue] = speciesAvatarGradient(id).match(/oklch\([\d.]+ [\d.]+ (\d+)\)/) ?? [];
			return Number(hue);
		});

		for (let i = 0; i < hues.length; i++) {
			for (let j = i + 1; j < hues.length; j++) {
				expect(Math.abs(hues[i] - hues[j])).toBeGreaterThan(10);
			}
		}
	});

	it('returns a linear-gradient', () => {
		expect(speciesAvatarGradient('4117')).toMatch(/^linear-gradient\(/);
	});
});
