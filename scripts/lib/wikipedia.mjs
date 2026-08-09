import { fetchWithRetry } from './http.mjs';

const SUMMARY_URL = (title) =>
	`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;

// Wikimedia's API etiquette requires a descriptive User-Agent identifying the caller;
// unidentified traffic is throttled more aggressively. https://meta.wikimedia.org/wiki/User-Agent_policy
const HEADERS = { 'User-Agent': 'Wildex (https://github.com/gbremond/wildex)' };

export async function fetchDescription(scientificName, fetchImpl = fetch) {
	const response = await fetchWithRetry(
		SUMMARY_URL(scientificName),
		{ headers: HEADERS },
		fetchImpl
	);

	if (!response.ok) return undefined;

	const summary = await response.json();

	return summary.extract || undefined;
}
