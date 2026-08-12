import { describe, expect, it } from 'vitest';
import { captureAccept } from './identification';

describe('captureAccept', () => {
	it('captures an image for a photo identification', () => {
		expect(captureAccept('photo')).toBe('image/*');
	});

	it('captures audio for a sound identification', () => {
		expect(captureAccept('sound')).toBe('audio/*');
	});

	it('captures nothing when the species is named by hand', () => {
		expect(captureAccept('manual')).toBeNull();
	});
});
