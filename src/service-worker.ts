// Disables access to DOM typings like `HTMLElement` which are not available
// inside a service worker and instantiates the correct globals
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

// Ensures that the `$service-worker` import has proper type definitions
/// <reference types="@sveltejs/kit" />

// Only necessary if you have an import from `$env/static/public`
/// <reference types="../.svelte-kit/ambient.d.ts" />

import { base, build, files, prerendered, version } from '$service-worker';
import { BIRD_IMAGE_CACHE, BIRD_IMAGE_HOST } from '$lib/species/species-image';
import { isObsoleteCache } from '$lib/cache-policy';

// This gives `self` the correct types
const self = globalThis.self as unknown as ServiceWorkerGlobalScope;

// Rebuilt on every deployment, so it carries the version in its name
const APP_CACHE = `cache-${version}`;

// Served by GitHub Pages for unknown paths, but absent from `build`, `files` and `prerendered`
const FALLBACK = `${base}/404.html`;

// GitHub Pages does not serve dotfiles: caching `.nojekyll` would 404 and reject the whole install
const ASSETS = [
	...build, // the app itself
	...files.filter((file) => !file.endsWith('/.nojekyll')), // everything in `static`
	...prerendered // the prerendered HTML pages
];

self.addEventListener('install', (event) => {
	event.waitUntil(precacheAppShell());
});

self.addEventListener('activate', (event) => {
	event.waitUntil(deleteObsoleteCaches());
});

self.addEventListener('message', (event) => {
	if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
	// ignore POST requests etc
	if (event.request.method !== 'GET') return;

	const url = new URL(event.request.url);

	if (url.hostname === BIRD_IMAGE_HOST) {
		event.respondWith(serveBirdImage(event));
		return;
	}

	event.respondWith(serveAppRequest(event, url));
});


// GitHub Pages serves the fallback with a 404 status, which `addAll` would reject
async function fetchFallbackAsOk(): Promise<Response> {
	const response = await fetch(FALLBACK);

	return new Response(await response.blob(), {
		status: 200,
		headers: { 'content-type': 'text/html' }
	});
}

async function precacheAppShell(): Promise<void> {
	const cache = await caches.open(APP_CACHE);

	await cache.addAll(ASSETS);
	await cache.put(FALLBACK, await fetchFallbackAsOk());
}

async function deleteObsoleteCaches(): Promise<void> {
	const keys = await caches.keys();

	await Promise.all(
		keys.filter((key) => isObsoleteCache(key, APP_CACHE)).map((key) => caches.delete(key))
	);
}

// Writing to a cache is best-effort: a full quota must not break the response.
async function store(cache: Cache, request: Request, response: Response): Promise<void> {
	try {
		await cache.put(request, response);
	} catch {
		// Out of storage, or a response the Cache API refuses to store.
	}
}

function isCacheableAsset(response: Response): boolean {
	return response.status === 200 && !response.headers.get('cache-control')?.includes('no-store');
}

// Cornell sends no CORS headers, so image responses are opaque: their status
// reads as 0 and only a readable response can be judged on `ok`.
function isCacheableImage(response: Response): boolean {
	return response.type === 'opaque' || response.ok;
}

// Bird photos never change and Cornell's endpoint is a small research service:
// serve one from cache once fetched, instead of re-fetching it on every view.
// This is also what fills the cache when the user downloads photos for offline
// use, so it is the single place bird images are written.
async function serveBirdImage(event: FetchEvent): Promise<Response> {
	const cache = await caches.open(BIRD_IMAGE_CACHE);
	const cached = await cache.match(event.request);

	if (cached) {
		return cached;
	}

	const response = await fetch(event.request);

	if (isCacheableImage(response)) {
		event.waitUntil(store(cache, event.request, response.clone()));
	}

	return response;
}

async function serveFromNetwork(event: FetchEvent, cache: Cache): Promise<Response> {
	const response = await fetch(event.request);

	// if we're offline, fetch can return a value that is not a Response
	// instead of throwing - and we can't pass this non-Response to respondWith
	if (!(response instanceof Response)) {
		throw new Error('invalid response from fetch');
	}

	if (isCacheableAsset(response)) {
		event.waitUntil(store(cache, event.request, response.clone()));
	}

	return response;
}

async function serveFromCache(event: FetchEvent, cache: Cache): Promise<Response | undefined> {
	const cached = await cache.match(event.request);

	if (cached) {
		return cached;
	}

	// offline navigations to uncached routes fall back to the SPA shell
	if (event.request.mode === 'navigate') {
		return cache.match(FALLBACK);
	}

	return undefined;
}

async function serveAppRequest(event: FetchEvent, url: URL): Promise<Response> {
	const cache = await caches.open(APP_CACHE);

	// `build`/`files` can always be served from the cache
	if (ASSETS.includes(url.pathname)) {
		const precached = await cache.match(url.pathname);

		if (precached) {
			return precached;
		}
	}

	// for everything else, try the network first, but
	// fall back to the cache if we're offline
	try {
		return await serveFromNetwork(event, cache);
	} catch (err) {
		const cached = await serveFromCache(event, cache);

		if (cached) {
			return cached;
		}

		// if there's no cache, then just error out
		// as there is nothing we can do to respond to this request
		throw err;
	}
}
