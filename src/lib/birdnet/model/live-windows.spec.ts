import { describe, expect, it } from 'vitest';
import { WindowAccumulator } from './live-windows';

const ramp = (from: number, length: number) =>
	Float32Array.from({ length }, (_, index) => from + index);

describe('WindowAccumulator', () => {
	it('yields nothing until a full window has arrived', () => {
		const accumulator = new WindowAccumulator(10, 5);

		expect(accumulator.push(ramp(0, 9))).toEqual([]);
	});

	it('yields a window as soon as one is complete', () => {
		const accumulator = new WindowAccumulator(10, 5);

		const windows = accumulator.push(ramp(0, 10));

		expect(windows).toHaveLength(1);
		expect(Array.from(windows[0])).toEqual(Array.from(ramp(0, 10)));
	});

	it('advances by the hop, so windows overlap', () => {
		const accumulator = new WindowAccumulator(10, 5);
		accumulator.push(ramp(0, 10));

		const windows = accumulator.push(ramp(10, 5));

		expect(windows).toHaveLength(1);
		expect(Array.from(windows[0])).toEqual(Array.from(ramp(5, 10)));
	});

	it('emits every window contained in one oversized block', () => {
		const accumulator = new WindowAccumulator(10, 5);

		const windows = accumulator.push(ramp(0, 20));

		expect(windows.map((w) => w[0])).toEqual([0, 5, 10]);
	});

	it('assembles a window from many undersized blocks', () => {
		const accumulator = new WindowAccumulator(10, 5);

		const windows = [
			...accumulator.push(ramp(0, 3)),
			...accumulator.push(ramp(3, 3)),
			...accumulator.push(ramp(6, 4))
		];

		expect(windows).toHaveLength(1);
		expect(Array.from(windows[0])).toEqual(Array.from(ramp(0, 10)));
	});

	it('does not grow without bound as audio keeps arriving', () => {
		const accumulator = new WindowAccumulator(10, 5);
		for (let i = 0; i < 100; i++) accumulator.push(ramp(i * 10, 10));

		expect(accumulator.buffered).toBeLessThan(10);
	});

	it('supports a hop equal to the window, giving no overlap', () => {
		const accumulator = new WindowAccumulator(4, 4);

		const windows = accumulator.push(ramp(0, 8));

		expect(windows.map((w) => w[0])).toEqual([0, 4]);
	});
});
