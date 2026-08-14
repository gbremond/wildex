import { describe, expect, it } from 'vitest';
import { CHUNK_SAMPLES, chunkPcm } from './chunks';

describe('chunkPcm', () => {
	it('cuts one chunk per three seconds of audio', () => {
		const { batch, count } = chunkPcm(new Float32Array(CHUNK_SAMPLES * 2));

		expect(count).toBe(2);
		expect(batch).toHaveLength(CHUNK_SAMPLES * 2);
	});

	it('drops the trailing partial chunk the model cannot accept', () => {
		const { batch, count } = chunkPcm(new Float32Array(CHUNK_SAMPLES * 2 + 12345));

		expect(count).toBe(2);
		expect(batch).toHaveLength(CHUNK_SAMPLES * 2);
	});

	it('yields nothing when the recording is shorter than one chunk', () => {
		const { batch, count } = chunkPcm(new Float32Array(CHUNK_SAMPLES - 1));

		expect(count).toBe(0);
		expect(batch).toHaveLength(0);
	});

	it('preserves the samples in order', () => {
		const pcm = new Float32Array(CHUNK_SAMPLES * 2);
		pcm[0] = 0.5;
		pcm[CHUNK_SAMPLES] = -0.25;

		const { batch } = chunkPcm(pcm);

		expect(batch[0]).toBe(0.5);
		expect(batch[CHUNK_SAMPLES]).toBe(-0.25);
	});
});
