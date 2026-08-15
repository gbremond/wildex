// The name is part of the on-device contract: changing it orphans a ~100 MB
// download already made by an installed app, so it stays as first shipped.
export const BIRDNET_CACHE = 'birdnet-models-v1';

const MODEL_FILES = ['model.onnx', 'birdnet_data_model.onnx', 'labels.txt'];

// onnxruntime-web requests these itself at load time, so they have to be cached
// under the same policy as the weights or the app is not really offline.
const RUNTIME_FILES = [
	'ort-wasm-simd-threaded.jsep.wasm',
	'ort-wasm-simd-threaded.jsep.mjs',
	'ort-wasm-simd-threaded.wasm',
	'ort-wasm-simd-threaded.mjs'
];

export function birdnetAssetUrls(base: string): string[] {
	return [
		...MODEL_FILES.map((file) => `${base}/models/birdnet/${file}`),
		...RUNTIME_FILES.map((file) => `${base}/ort/${file}`)
	];
}

/** Too large for the versioned app shell: these live in their own durable cache. */
export function isBirdnetAsset(pathname: string): boolean {
	return pathname.includes('/models/birdnet/') || pathname.includes('/ort/');
}
