// FNV-1a barely mixes the last character it hashes, so ids sharing a prefix
// (same-genus TaxRef ids like "4190"/"4192") landed on nearly the same hue.
// This finalizer, borrowed from MurmurHash3, spreads the bits before use.
function hashSeed(seed: string): number {
	let hash = 0x811c9dc5;

	for (let i = 0; i < seed.length; i++) {
		hash ^= seed.charCodeAt(i);
		hash = Math.imul(hash, 0x01000193);
	}

	hash ^= hash >>> 16;
	hash = Math.imul(hash, 0x85ebca6b);
	hash ^= hash >>> 13;
	hash = Math.imul(hash, 0xc2b2ae35);
	hash ^= hash >>> 16;

	return hash >>> 0;
}

export function speciesAvatarGradient(seed: string): string {
	const hue = hashSeed(seed) % 360;

	// oklch keeps every hue equally vivid; hsl would make some hues (e.g. yellow-green) look muddy.
	return `linear-gradient(300deg, #ffefb3, oklch(0.70 0.15 ${hue}))`;
}
