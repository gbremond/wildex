import workletUrl from './pcm-worklet.js?url';
import { CHUNK_SAMPLES, SAMPLE_RATE } from './chunks';
import { WindowAccumulator } from './live-windows';
import { DetectionLog } from './detections';
import { gateByPrior, parseLabel, topSpecies, type Species } from './predictions';
import { PRIOR_THRESHOLD, type Birdnet, type Where } from './session';
import { encodeWav } from './wav';

/** Windows overlap by half, so a call on a boundary still lands inside one. */
const HOP_SECONDS = 1.5;
const WINDOW_SECONDS = 3;

/**
 * Tuned by guess, not by field data — the first thing to revisit with real
 * recordings. BirdNET-Analyzer's own default detection threshold is 0.1.
 */
const DETECTION_RULES = {
	threshold: 0.5,
	independenceGap: Math.round(WINDOW_SECONDS / HOP_SECONDS),
	requiredHits: 2
};

export type HeardSpecies = Species & {
	/** Seconds into the session when this species was first heard. */
	firstHeardSeconds: number;
	/** The 3s window that confirmed it, as evidence for the observation. */
	evidence: File;
};

export type LiveTick = {
	/** Top of the window just analysed — unconfirmed, for live feedback. */
	now: Species[];
	/** Species that cleared the rules in several non-overlapping windows. */
	heard: HeardSpecies[];
	windows: number;
	lastInferenceMs: number;
	/** Windows dropped because inference was still busy. */
	dropped: number;
};

export class LiveListener {
	private context?: AudioContext;
	private stream?: MediaStream;
	private running = false;
	private busy = false;
	private prior?: Float32Array;
	private readonly detections = new DetectionLog(DETECTION_RULES);
	// Only the window that confirmed a species is kept — retaining every window
	// speculatively would cost 576 kB each for audio almost all of which is thrown away.
	private readonly evidence = new Map<number, File>();
	private windows = 0;
	private dropped = 0;

	constructor(
		private readonly birdnet: Birdnet,
		private readonly where: Where,
		private readonly onTick: (tick: LiveTick) => void
	) {}

	async start(stream: MediaStream) {
		this.stream = stream;
		this.running = true;
		this.prior = await this.birdnet.prior(this.where);

		const context = new AudioContext({ sampleRate: SAMPLE_RATE });
		this.context = context;
		await context.audioWorklet.addModule(workletUrl);
		await context.resume();

		const rate = context.sampleRate;
		const accumulator = new WindowAccumulator(
			Math.round(WINDOW_SECONDS * rate),
			Math.round(HOP_SECONDS * rate)
		);

		const collector = new AudioWorkletNode(context, 'pcm-collector');
		collector.port.onmessage = (event) => this.onParcel(event.data, accumulator, rate);

		context.createMediaStreamSource(stream).connect(collector);
		// Keeps the graph pulling without routing the microphone to the speaker.
		collector.connect(context.createGain()).connect(context.destination);
	}

	async stop() {
		this.running = false;
		for (const track of this.stream?.getTracks() ?? []) track.stop();
		await this.context?.close();
		this.context = undefined;
		this.stream = undefined;
	}

	private onParcel(parcel: Float32Array, accumulator: WindowAccumulator, rate: number) {
		if (!this.running) return;

		for (const window of accumulator.push(parcel)) {
			// Dropping a window beats queueing them up and falling ever further behind.
			if (this.busy) {
				this.dropped++;
				continue;
			}
			void this.analyse(window, rate);
		}
	}

	private async analyse(window: Float32Array, rate: number) {
		this.busy = true;
		try {
			const pcm = rate === SAMPLE_RATE ? window : await resample(window, rate);
			const started = performance.now();
			const raw = await this.birdnet.scoreWindow(pcm);
			const lastInferenceMs = performance.now() - started;

			if (!this.running) return;

			const scores = gateByPrior(raw, this.prior!, PRIOR_THRESHOLD);
			const windowIndex = this.windows++;

			for (const species of this.detections.observe(scores, windowIndex)) {
				this.evidence.set(species, this.toEvidence(species, pcm));
			}

			this.onTick({
				now: topSpecies(scores, this.birdnet.speciesLabels, 3),
				heard: this.heardSpecies(),
				windows: this.windows,
				lastInferenceMs,
				dropped: this.dropped
			});
		} finally {
			this.busy = false;
		}
	}

	private heardSpecies(): HeardSpecies[] {
		return this.detections.confirmed().map((detection) => ({
			...parseLabel(this.birdnet.speciesLabels[detection.species]),
			score: detection.peak,
			firstHeardSeconds: detection.firstHeardWindow * HOP_SECONDS,
			evidence: this.evidence.get(detection.species)!
		}));
	}

	private toEvidence(species: number, pcm: Float32Array): File {
		const { scientific } = parseLabel(this.birdnet.speciesLabels[species]);
		const name = `${scientific.replace(/\s+/g, '-').toLowerCase()}.wav`;

		return new File([encodeWav(pcm, SAMPLE_RATE)], name, { type: 'audio/wav' });
	}
}

/**
 * iOS refuses the 48 kHz AudioContext we ask for and hands back 44.1 kHz. Left
 * uncorrected that shifts every frequency up 8.8% and the model confidently
 * names a neighbouring species, so every window is pinned to exactly 48 kHz.
 */
async function resample(window: Float32Array, fromRate: number): Promise<Float32Array> {
	const source = new AudioBuffer({ length: window.length, sampleRate: fromRate });
	source.getChannelData(0).set(window);

	const target = new OfflineAudioContext(1, CHUNK_SAMPLES, SAMPLE_RATE);
	const node = target.createBufferSource();
	node.buffer = source;
	node.connect(target.destination);
	node.start();

	return (await target.startRendering()).getChannelData(0);
}
