import { describe, expect, it } from 'vitest';
import { diagnoseMicrophoneError } from './microphone-errors';

const denial = (name: string, message: string) => new DOMException(message, name);

describe('diagnoseMicrophoneError', () => {
	it('separates an Android-level block from a site-level one', () => {
		const system = diagnoseMicrophoneError(
			denial('NotAllowedError', 'Permission denied by system')
		);
		const site = diagnoseMicrophoneError(denial('NotAllowedError', 'Permission denied'));

		expect(system.cause).not.toBe(site.cause);
	});

	it('sends an Android-level block to the OS settings', () => {
		const diagnosis = diagnoseMicrophoneError(
			denial('NotAllowedError', 'Permission denied by system')
		);

		expect(diagnosis.fix).toMatch(/Android/i);
	});

	it('sends a site-level block to the padlock menu', () => {
		const diagnosis = diagnoseMicrophoneError(denial('NotAllowedError', 'Permission denied'));

		expect(diagnosis.fix).toMatch(/padlock|site settings/i);
	});

	it('tells a dismissed prompt apart from a refusal', () => {
		const diagnosis = diagnoseMicrophoneError(denial('NotAllowedError', 'Permission dismissed'));

		expect(diagnosis.cause).toMatch(/dismissed/i);
	});

	it('reports a missing microphone', () => {
		expect(diagnoseMicrophoneError(denial('NotFoundError', '')).cause).toMatch(/no microphone/i);
	});

	it('reports an insecure origin', () => {
		expect(diagnoseMicrophoneError(denial('SecurityError', '')).fix).toMatch(/https/i);
	});

	it('reports a microphone already held by another app', () => {
		expect(diagnoseMicrophoneError(denial('NotReadableError', '')).cause).toMatch(/in use|busy/i);
	});

	it('blames our own constraints when they cannot be met', () => {
		expect(diagnoseMicrophoneError(denial('OverconstrainedError', '')).cause).toMatch(
			/constraint/i
		);
	});

	it('keeps the raw name and message for anything unrecognised', () => {
		const diagnosis = diagnoseMicrophoneError(denial('WeirdError', 'something odd'));

		expect(diagnosis.cause).toContain('WeirdError');
		expect(diagnosis.cause).toContain('something odd');
	});

	it('survives a thrown value that is not an error at all', () => {
		expect(diagnoseMicrophoneError('boom').cause).toContain('boom');
	});
});
