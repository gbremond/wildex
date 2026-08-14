/**
 * Turns the irregular blocks arriving from the audio thread into fixed-size
 * analysis windows. Windows overlap by `window - hop` so a call landing on a
 * boundary is not cut in half and missed.
 */
export class WindowAccumulator {
	private pending: Float32Array;
	private filled = 0;

	constructor(
		private readonly windowSamples: number,
		private readonly hopSamples: number
	) {
		this.pending = new Float32Array(windowSamples);
	}

	/** Samples held but not yet forming a window. */
	get buffered(): number {
		return this.filled;
	}

	push(block: Float32Array): Float32Array[] {
		const windows: Float32Array[] = [];

		for (let read = 0; read < block.length;) {
			const room = this.windowSamples - this.filled;
			const take = Math.min(room, block.length - read);
			this.pending.set(block.subarray(read, read + take), this.filled);
			this.filled += take;
			read += take;

			if (this.filled === this.windowSamples) {
				windows.push(this.pending.slice());
				this.slideByHop();
			}
		}

		return windows;
	}

	private slideByHop() {
		const keep = this.windowSamples - this.hopSamples;
		this.pending.copyWithin(0, this.hopSamples);
		this.filled = keep;
	}
}
