import { fetchWithRetry } from './http.mjs';

const SUMMARY_URL = (language, title) =>
	`https://${language}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;

// Wikimedia's API etiquette requires a descriptive User-Agent identifying the caller;
// unidentified traffic is throttled more aggressively. https://meta.wikimedia.org/wiki/User-Agent_policy
const HEADERS = { 'User-Agent': 'Wildex (https://github.com/gbremond/wildex)' };

export async function fetchDescription(title, language = 'en', fetchImpl = fetch) {
	const response = await fetchWithRetry(
		SUMMARY_URL(language, title),
		{ headers: HEADERS },
		fetchImpl
	);

	if (!response.ok) return undefined;

	const summary = await response.json();

	// A disambiguation page lists namesakes instead of describing the bird.
	if (summary.type !== 'standard') return undefined;

	return summary.extract || undefined;
}

// French Wikipedia redirects most scientific names to the article, but not all of them.
export async function fetchFrenchDescription({ scientificName, frenchName }, fetchImpl = fetch) {
	return (
		(await fetchDescription(scientificName, 'fr', fetchImpl)) ??
		(await fetchDescription(frenchName, 'fr', fetchImpl))
	);
}
