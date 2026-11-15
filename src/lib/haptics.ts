// Felt, not heard: a sound in the field would flush the bird being logged.
const PATTERNS = {
	saved: 15,
	firstSighting: [20, 70, 20, 70, 60]
} satisfies Record<string, VibratePattern>;

/** Does nothing where vibration is unsupported, such as Safari on iOS. */
export function vibrate(moment: keyof typeof PATTERNS): void {
	if ('vibrate' in navigator) navigator.vibrate(PATTERNS[moment]);
}
