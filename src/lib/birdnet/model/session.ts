import * as ort from 'onnxruntime-web';
import { base } from '$app/paths';
import { CHUNK_SAMPLES, chunkPcm } from './chunks';
import { gateByPrior, peakScores, topSpecies, type Species } from './predictions';

const SPECIES_COUNT = 6522;

/** BirdNET-Analyzer's default location filter cutoff. */
export const PRIOR_THRESHOLD = 0.03;

export type Identification = {
	species: Species[];
	chunks: number;
	inferenceMs: number;
	/** Species the geo model considers plausible here and now, out of 6522. */
	plausible: number;
};

export type Where = { latitude: number; longitude: number; week: number };

let loading: Promise<Birdnet> | undefined;

export function loadBirdnet(): Promise<Birdnet> {
	loading ??= Birdnet.create();
	return loading;
}

export class Birdnet {
	private constructor(
		private readonly audio: ort.InferenceSession,
		private readonly geo: ort.InferenceSession,
		private readonly labels: string[]
	) {}

	static async create(): Promise<Birdnet> {
		ort.env.wasm.wasmPaths = `${base}/ort/`;
		ort.env.wasm.numThreads = 1;

		const models = `${base}/models/birdnet`;
		const [audio, geo, labels] = await Promise.all([
			ort.InferenceSession.create(`${models}/model.onnx`),
			ort.InferenceSession.create(`${models}/birdnet_data_model.onnx`),
			fetch(`${models}/labels.txt`).then((response) => response.text())
		]);

		return new Birdnet(
			audio,
			geo,
			labels.split('\n').map((line) => line.trim())
		);
	}

	get speciesLabels(): string[] {
		return this.labels;
	}

	/** Scores one 3-second window. Ungated — the caller owns the geo prior. */
	async scoreWindow(pcm: Float32Array): Promise<Float32Array> {
		const { Identity_0 } = await this.audio.run({
			INPUT: new ort.Tensor('float32', pcm, [1, CHUNK_SAMPLES])
		});
		return peakScores(Identity_0.data as Float32Array, SPECIES_COUNT);
	}

	/** Occurrence probability per species for a place and week (1..48). */
	async prior({ latitude, longitude, week }: Where): Promise<Float32Array> {
		const input = new ort.Tensor('float32', Float32Array.from([latitude, longitude, week]), [1, 3]);
		const { output } = await this.geo.run({ input });
		return output.data as Float32Array;
	}

	async identify(pcm: Float32Array, where: Where): Promise<Identification> {
		const { batch, count } = chunkPcm(pcm);
		if (count === 0)
			throw new Error('Recording is shorter than the 3 second window BirdNET needs.');

		const prior = await this.prior(where);

		const started = performance.now();
		const { Identity_0 } = await this.audio.run({
			INPUT: new ort.Tensor('float32', batch, [count, CHUNK_SAMPLES])
		});
		const inferenceMs = performance.now() - started;

		const scores = peakScores(Identity_0.data as Float32Array, SPECIES_COUNT);

		return {
			species: topSpecies(gateByPrior(scores, prior, PRIOR_THRESHOLD), this.labels, 5),
			chunks: count,
			inferenceMs,
			plausible: prior.reduce((n, p) => (p > PRIOR_THRESHOLD ? n + 1 : n), 0)
		};
	}
}
