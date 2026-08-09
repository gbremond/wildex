const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);

export async function fetchWithRetry(url, options, fetchImpl = fetch, maxRetries = 3) {
	for (let attempt = 0; ; attempt++) {
		const response = await fetchImpl(url, options);

		if (response.ok || !RETRYABLE_STATUSES.has(response.status) || attempt === maxRetries) {
			return response;
		}

		const retryAfterSeconds = Number(response.headers.get('retry-after'));
		const delayMs = retryAfterSeconds > 0 ? retryAfterSeconds * 1000 : 500 * 2 ** attempt;

		await new Promise((resolve) => setTimeout(resolve, delayMs));
	}
}
