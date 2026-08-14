/// <reference types="@types/audioworklet" />

/**
 * Runs on the audio thread. Deliberately dumb: it batches the 128-sample blocks
 * the browser delivers into ~quarter-second parcels and posts them on. All the
 * windowing lives on the main thread where it can be tested.
 *
 * Plain JS with no imports — AudioWorklet scope has no bundler.
 */
const PARCEL_SECONDS = 0.25;

class PcmCollector extends AudioWorkletProcessor {
	constructor() {
		super();
		this.parcel = new Float32Array(Math.round(sampleRate * PARCEL_SECONDS));
		this.filled = 0;
	}

	/** @param {Float32Array[][]} inputs */
	process(inputs) {
		const channel = inputs[0]?.[0];
		if (!channel) return true;

		for (let read = 0; read < channel.length;) {
			const take = Math.min(this.parcel.length - this.filled, channel.length - read);
			this.parcel.set(channel.subarray(read, read + take), this.filled);
			this.filled += take;
			read += take;

			if (this.filled === this.parcel.length) {
				const full = this.parcel.slice();
				this.port.postMessage(full, [full.buffer]);
				this.filled = 0;
			}
		}

		return true;
	}
}

registerProcessor('pcm-collector', PcmCollector);
