import * as ort from 'onnxruntime-web';
import { base } from '$app/paths';
import { CHUNK_SAMPLES } from './chunks';
import { peakScores } from './predictions';

const SPECIES_COUNT = 6522;

/** BirdNET-Analyzer's default location filter cutoff. */
export const PRIOR_THRESHOLD = 0.03;

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
}
