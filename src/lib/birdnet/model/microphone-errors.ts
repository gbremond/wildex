export type MicrophoneDiagnosis =
	| 'blocked-by-android'
	| 'prompt-dismissed'
	| 'blocked-by-site'
	| 'no-microphone'
	| 'insecure-context'
	| 'in-use'
	| 'unmet-constraints'
	| 'unrecognised';

/**
 * getUserMedia reports every refusal as NotAllowedError, but the message tells
 * an Android-level block apart from a site-level one — and they need different
 * fixes. The DOMException name is the discriminator, so it must not be dropped.
 */
export function diagnoseMicrophoneError(error: unknown): MicrophoneDiagnosis {
	const name = error instanceof DOMException ? error.name : '';
	const message = error instanceof Error ? error.message : String(error);

	if (name === 'NotAllowedError') return diagnoseRefusal(message);
	if (name === 'NotFoundError') return 'no-microphone';
	if (name === 'SecurityError') return 'insecure-context';
	if (name === 'NotReadableError') return 'in-use';
	if (name === 'OverconstrainedError') return 'unmet-constraints';
	return 'unrecognised';
}

function diagnoseRefusal(message: string): MicrophoneDiagnosis {
	if (/by system/i.test(message)) return 'blocked-by-android';
	if (/dismissed/i.test(message)) return 'prompt-dismissed';
	return 'blocked-by-site';
}
