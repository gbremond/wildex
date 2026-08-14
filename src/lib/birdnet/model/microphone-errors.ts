export type MicrophoneDiagnosis = {
	cause: string;
	fix: string;
};

/**
 * getUserMedia reports every refusal as NotAllowedError, but the message tells
 * an Android-level block apart from a site-level one — and they need different
 * fixes. The DOMException name is the discriminator, so it must not be dropped.
 */
export function diagnoseMicrophoneError(error: unknown): MicrophoneDiagnosis {
	const name = error instanceof DOMException ? error.name : '';
	const message = error instanceof Error ? error.message : String(error);

	if (name === 'NotAllowedError') return diagnoseRefusal(message);

	if (name === 'NotFoundError') {
		return {
			cause: 'No microphone was reported by the device.',
			fix: 'Check that no other profile or policy is hiding the microphone.'
		};
	}

	if (name === 'SecurityError') {
		return {
			cause: 'The page is not a secure context.',
			fix: 'Serve the page over HTTPS — `cloudflared tunnel --url http://localhost:5173`.'
		};
	}

	if (name === 'NotReadableError') {
		return {
			cause: 'The microphone is in use by another app.',
			fix: 'Close anything recording or on a call, then retry.'
		};
	}

	if (name === 'OverconstrainedError') {
		return {
			cause: 'The device cannot meet the audio constraints we asked for.',
			fix: 'Report this — MICROPHONE_CONSTRAINTS in capture.ts needs relaxing for this device.'
		};
	}

	return {
		cause: `${name || 'Error'}: ${message}`,
		fix: 'Unrecognised failure — report the cause above.'
	};
}

function diagnoseRefusal(message: string): MicrophoneDiagnosis {
	if (/by system/i.test(message)) {
		return {
			cause: 'Android is blocking the microphone for Chrome itself.',
			fix: 'Android Settings → Apps → Chrome → Permissions → Microphone → Allow.'
		};
	}

	if (/dismissed/i.test(message)) {
		return {
			cause: 'The permission prompt was dismissed rather than answered.',
			fix: 'Retry and choose Allow when Chrome asks.'
		};
	}

	return {
		cause: 'This site is blocked from using the microphone.',
		fix: 'Tap the padlock in the address bar → Permissions → Microphone → Allow, then reload.'
	};
}
