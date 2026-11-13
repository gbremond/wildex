import { m } from '$lib/paraglide/messages';
import type { MicrophoneDiagnosis } from '../model/microphone-errors';

type Advice = { cause: () => string; fix: () => string };

export const MICROPHONE_ADVICE: Record<MicrophoneDiagnosis, Advice> = {
	'blocked-by-android': {
		cause: m.mic_blocked_by_android_cause,
		fix: m.mic_blocked_by_android_fix
	},
	'prompt-dismissed': { cause: m.mic_prompt_dismissed_cause, fix: m.mic_prompt_dismissed_fix },
	'blocked-by-site': { cause: m.mic_blocked_by_site_cause, fix: m.mic_blocked_by_site_fix },
	'no-microphone': { cause: m.mic_no_microphone_cause, fix: m.mic_no_microphone_fix },
	'insecure-context': { cause: m.mic_insecure_context_cause, fix: m.mic_insecure_context_fix },
	'in-use': { cause: m.mic_in_use_cause, fix: m.mic_in_use_fix },
	'unmet-constraints': { cause: m.mic_unmet_constraints_cause, fix: m.mic_unmet_constraints_fix },
	unrecognised: { cause: m.mic_unrecognised_cause, fix: m.mic_unrecognised_fix }
};
