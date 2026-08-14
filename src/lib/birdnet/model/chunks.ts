export const SAMPLE_RATE = 48000;

/** The audio model's input is fixed at 3.0 seconds of 48 kHz mono. */
export const CHUNK_SAMPLES = SAMPLE_RATE * 3;

export type PcmBatch = {
	/** Flat [count, CHUNK_SAMPLES] tensor data. */
	batch: Float32Array;
	count: number;
};

export function chunkPcm(pcm: Float32Array): PcmBatch {
	const count = Math.floor(pcm.length / CHUNK_SAMPLES);
	return { batch: pcm.slice(0, count * CHUNK_SAMPLES), count };
}
