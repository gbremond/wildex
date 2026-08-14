import { createWriteStream } from 'node:fs';
import { copyFile, mkdir, stat } from 'node:fs/promises';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

const MODEL_DIR = 'static/models/birdnet';
const ORT_DIR = 'static/ort';
const BASE = 'https://huggingface.co/justinchuby/BirdNET-onnx/resolve/main';

const MODELS = [
	['model.onnx', `${BASE}/model.onnx`],
	['birdnet_data_model.onnx', `${BASE}/birdnet_data_model.onnx`],
	['labels.txt', `${BASE}/BirdNET_GLOBAL_6K_V2.4_Labels.txt`]
];

// onnxruntime-web loads these at runtime; they cannot be bundled by Vite.
// The default entry point resolves the `jsep` build — it carries the WebGPU and
// WebNN backends alongside WASM, so it is the pair the browser actually asks for.
const ORT_RUNTIME = [
	'ort-wasm-simd-threaded.jsep.wasm',
	'ort-wasm-simd-threaded.jsep.mjs',
	'ort-wasm-simd-threaded.wasm',
	'ort-wasm-simd-threaded.mjs'
];

async function exists(path) {
	try {
		await stat(path);
		return true;
	} catch {
		return false;
	}
}

async function download(name, url) {
	const target = `${MODEL_DIR}/${name}`;
	if (await exists(target)) {
		console.log(`✓ ${name} (cached)`);
		return;
	}

	const response = await fetch(url);
	if (!response.ok) throw new Error(`${name}: ${response.status} ${response.statusText}`);

	await pipeline(Readable.fromWeb(response.body), createWriteStream(target));
	const { size } = await stat(target);
	console.log(`↓ ${name} (${(size / 1e6).toFixed(1)} MB)`);
}

await mkdir(MODEL_DIR, { recursive: true });
await mkdir(ORT_DIR, { recursive: true });

for (const [name, url] of MODELS) await download(name, url);

for (const name of ORT_RUNTIME) {
	await copyFile(`node_modules/onnxruntime-web/dist/${name}`, `${ORT_DIR}/${name}`);
	console.log(`→ ${name}`);
}

console.log('\nBirdNET models ready. Licence: CC BY-NC-SA 4.0 — see static/models/birdnet/NOTICE');
