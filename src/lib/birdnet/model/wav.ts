const HEADER_BYTES = 44;
const BYTES_PER_SAMPLE = 2;
const BITS_PER_SAMPLE = 16;
const MONO = 1;
const PCM_FORMAT = 1;

function writeText(view: DataView, offset: number, text: string) {
	for (let index = 0; index < text.length; index++) {
		view.setUint8(offset + index, text.charCodeAt(index));
	}
}

/**
 * The window that identified a species is kept as evidence on the observation.
 * WAV rather than a compressed format: the encoder is a header and a cast, where
 * anything else would mean shipping a codec for a three second clip.
 */
export function encodeWav(pcm: Float32Array, sampleRate: number): ArrayBuffer {
	const dataBytes = pcm.length * BYTES_PER_SAMPLE;
	const buffer = new ArrayBuffer(HEADER_BYTES + dataBytes);
	const view = new DataView(buffer);

	writeText(view, 0, 'RIFF');
	view.setUint32(4, HEADER_BYTES - 8 + dataBytes, true);
	writeText(view, 8, 'WAVE');

	writeText(view, 12, 'fmt ');
	view.setUint32(16, 16, true); // fmt chunk length
	view.setUint16(20, PCM_FORMAT, true);
	view.setUint16(22, MONO, true);
	view.setUint32(24, sampleRate, true);
	view.setUint32(28, sampleRate * MONO * BYTES_PER_SAMPLE, true); // byte rate
	view.setUint16(32, MONO * BYTES_PER_SAMPLE, true); // block align
	view.setUint16(34, BITS_PER_SAMPLE, true);

	writeText(view, 36, 'data');
	view.setUint32(40, dataBytes, true);

	for (let index = 0; index < pcm.length; index++) {
		const clipped = Math.max(-1, Math.min(1, pcm[index]));
		const sample = clipped < 0 ? clipped * 0x8000 : clipped * 0x7fff;
		view.setInt16(HEADER_BYTES + index * BYTES_PER_SAMPLE, sample, true);
	}

	return buffer;
}
