import { describe, expect, it } from 'vitest';
import { DetectionLog } from './detections';

/** Two species, so a score array is [speciesA, speciesB]. */
const scores = (a: number, b = 0) => new Float32Array([a, b]);

// Windows overlap by half, so windows 2 apart share no audio.
const log = () => new DetectionLog({ threshold: 0.5, independenceGap: 2, requiredHits: 2 });

describe('DetectionLog', () => {
	it('does not confirm a species heard in a single window', () => {
		const detections = log();

		detections.observe(scores(0.9), 0);

		expect(detections.confirmed()).toEqual([]);
	});

	it('confirms a species heard in two independent windows', () => {
		const detections = log();

		detections.observe(scores(0.9), 0);
		detections.observe(scores(0.8), 2);

		expect(detections.confirmed().map((d) => d.species)).toEqual([0]);
	});

	it('ignores a second hit that shares audio with the first', () => {
		const detections = log();

		detections.observe(scores(0.9), 0);
		detections.observe(scores(0.9), 1);

		expect(detections.confirmed()).toEqual([]);
	});

	it('never counts a score below the threshold', () => {
		const detections = log();

		detections.observe(scores(0.49), 0);
		detections.observe(scores(0.49), 2);
		detections.observe(scores(0.49), 4);

		expect(detections.confirmed()).toEqual([]);
	});

	it('confirms a bird that sings again after a long silence', () => {
		const detections = log();

		detections.observe(scores(0.7), 0);
		for (let window = 1; window < 40; window++) detections.observe(scores(0), window);
		detections.observe(scores(0.7), 40);

		expect(detections.confirmed().map((d) => d.species)).toEqual([0]);
	});

	it('remembers when the species was first heard, not when it was confirmed', () => {
		const detections = log();

		detections.observe(scores(0.9), 3);
		detections.observe(scores(0.9), 9);

		expect(detections.confirmed()[0].firstHeardWindow).toBe(3);
	});

	it('keeps the loudest score the species reached', () => {
		const detections = log();

		detections.observe(scores(0.6), 0);
		detections.observe(scores(0.95), 2);
		detections.observe(scores(0.7), 4);

		expect(detections.confirmed()[0].peak).toBeCloseTo(0.95, 5);
	});

	it('tracks each species independently', () => {
		const detections = log();

		detections.observe(new Float32Array([0.9, 0.1]), 0);
		detections.observe(new Float32Array([0.9, 0.9]), 2);
		detections.observe(new Float32Array([0.1, 0.9]), 4);

		expect(detections.confirmed().map((d) => d.species)).toEqual([0, 1]);
	});

	it('orders detections by when each was first heard', () => {
		const detections = log();

		detections.observe(new Float32Array([0, 0.9]), 0);
		detections.observe(new Float32Array([0.9, 0.9]), 2);
		detections.observe(new Float32Array([0.9, 0]), 4);

		expect(detections.confirmed().map((d) => d.species)).toEqual([1, 0]);
	});
});
