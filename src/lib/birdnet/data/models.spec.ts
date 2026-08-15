import { describe, expect, it } from 'vitest';
import { birdnetAssetUrls, isBirdnetAsset } from './models';

describe('isBirdnetAsset', () => {
	it('claims the weights', () => {
		expect(isBirdnetAsset('/wildex/models/birdnet/model.onnx')).toBe(true);
	});

	it('claims the inference runtime', () => {
		expect(isBirdnetAsset('/wildex/ort/ort-wasm-simd-threaded.jsep.wasm')).toBe(true);
	});

	it('leaves the app shell alone', () => {
		expect(isBirdnetAsset('/wildex/birds.json')).toBe(false);
		expect(isBirdnetAsset('/wildex/_app/immutable/entry/app.js')).toBe(false);
	});

	it('does not claim a route that merely mentions a model', () => {
		expect(isBirdnetAsset('/wildex/models')).toBe(false);
	});
});

describe('birdnetAssetUrls', () => {
	it('lists everything needed to identify a sound offline', () => {
		const urls = birdnetAssetUrls('/wildex');

		expect(urls).toEqual(
			expect.arrayContaining([
				'/wildex/models/birdnet/model.onnx',
				'/wildex/models/birdnet/birdnet_data_model.onnx',
				'/wildex/models/birdnet/labels.txt'
			])
		);
	});

	it('every listed url is one the cache layer will claim', () => {
		birdnetAssetUrls('/wildex').forEach((url) => expect(isBirdnetAsset(url)).toBe(true));
	});

	it('works when the app is served from the domain root', () => {
		expect(birdnetAssetUrls('')).toEqual(expect.arrayContaining(['/models/birdnet/model.onnx']));
	});
});
