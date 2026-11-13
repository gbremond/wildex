import { describe, expect, it } from 'vitest';
import { diagnoseMicrophoneError } from './microphone-errors';

const denial = (name: string, message: string) => new DOMException(message, name);

describe('diagnoseMicrophoneError', () => {
	it('separates an Android-level block from a site-level one', () => {
		const system = diagnoseMicrophoneError(
			denial('NotAllowedError', 'Permission denied by system')
		);
		const site = diagnoseMicrophoneError(denial('NotAllowedError', 'Permission denied'));

		expect(system).toBe('blocked-by-android');
		expect(site).toBe('blocked-by-site');
	});

	it('tells a dismissed prompt apart from a refusal', () => {
		expect(diagnoseMicrophoneError(denial('NotAllowedError', 'Permission dismissed'))).toBe(
			'prompt-dismissed'
		);
	});

	it('reports a missing microphone', () => {
		expect(diagnoseMicrophoneError(denial('NotFoundError', ''))).toBe('no-microphone');
	});

	it('reports an insecure origin', () => {
		expect(diagnoseMicrophoneError(denial('SecurityError', ''))).toBe('insecure-context');
	});

	it('reports a microphone already held by another app', () => {
		expect(diagnoseMicrophoneError(denial('NotReadableError', ''))).toBe('in-use');
	});

	it('blames our own constraints when they cannot be met', () => {
		expect(diagnoseMicrophoneError(denial('OverconstrainedError', ''))).toBe('unmet-constraints');
	});

	it('does not guess at anything unrecognised', () => {
		expect(diagnoseMicrophoneError(denial('WeirdError', 'something odd'))).toBe('unrecognised');
	});

	it('survives a thrown value that is not an error at all', () => {
		expect(diagnoseMicrophoneError('boom')).toBe('unrecognised');
	});
});
