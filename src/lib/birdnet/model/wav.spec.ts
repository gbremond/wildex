import { describe, expect, it } from 'vitest';
import { encodeWav } from './wav';

const text = (view: DataView, offset: number, length: number) =>
	String.fromCharCode(...new Uint8Array(view.buffer, offset, length));

const viewOf = (pcm: Float32Array, rate = 48000) => new DataView(encodeWav(pcm, rate));

describe('encodeWav', () => {
	it('writes a RIFF/WAVE container', () => {
		const view = viewOf(new Float32Array(4));

		expect(text(view, 0, 4)).toBe('RIFF');
		expect(text(view, 8, 4)).toBe('WAVE');
	});

	it('declares mono 16-bit PCM at the sample rate it was given', () => {
		const view = viewOf(new Float32Array(4), 48000);

		expect(view.getUint16(20, true)).toBe(1); // format: PCM
		expect(view.getUint16(22, true)).toBe(1); // channels: mono
		expect(view.getUint32(24, true)).toBe(48000);
		expect(view.getUint16(34, true)).toBe(16); // bits per sample
	});

	it('sizes the file as a 44 byte header plus two bytes per sample', () => {
		expect(encodeWav(new Float32Array(1000), 48000).byteLength).toBe(44 + 2000);
	});

	it('reports the data length the samples actually occupy', () => {
		const view = viewOf(new Float32Array(1000));

		expect(view.getUint32(40, true)).toBe(2000);
	});

	it('maps full scale to the extremes of a signed 16-bit sample', () => {
		const view = viewOf(new Float32Array([1, -1, 0]));

		expect(view.getInt16(44, true)).toBe(32767);
		expect(view.getInt16(46, true)).toBe(-32768);
		expect(view.getInt16(48, true)).toBe(0);
	});

	it('clips samples that overshoot instead of wrapping them', () => {
		const view = viewOf(new Float32Array([4, -4]));

		expect(view.getInt16(44, true)).toBe(32767);
		expect(view.getInt16(46, true)).toBe(-32768);
	});
});
