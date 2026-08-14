export type Detection = {
	/** Index into the label list. */
	species: number;
	firstHeardWindow: number;
	peak: number;
};

export type DetectionRules = {
	/** Score a window must reach to count as evidence. */
	threshold: number;
	/**
	 * How many windows apart two hits must be to count as separate evidence.
	 * Windows overlap, so adjacent ones can share the same call.
	 */
	independenceGap: number;
	requiredHits: number;
};

type Track = {
	hits: number;
	peak: number;
	firstHeardWindow: number;
	lastHitWindow: number;
};

/**
 * Promotes a species to "heard" only once it has cleared the threshold in
 * several non-overlapping windows. A single confident window is usually a
 * confusable neighbour of whatever is actually singing, and without this it
 * would stick at its peak for the rest of the session.
 */
export class DetectionLog {
	private readonly tracks = new Map<number, Track>();

	constructor(private readonly rules: DetectionRules) {}

	observe(scores: Float32Array, windowIndex: number) {
		for (let species = 0; species < scores.length; species++) {
			if (scores[species] < this.rules.threshold) continue;
			this.recordHit(species, scores[species], windowIndex);
		}
	}

	confirmed(): Detection[] {
		return [...this.tracks.entries()]
			.filter(([, track]) => track.hits >= this.rules.requiredHits)
			.map(([species, track]) => ({
				species,
				firstHeardWindow: track.firstHeardWindow,
				peak: track.peak
			}))
			.sort((a, b) => a.firstHeardWindow - b.firstHeardWindow);
	}

	private recordHit(species: number, score: number, windowIndex: number) {
		const track = this.tracks.get(species);

		if (!track) {
			this.tracks.set(species, {
				hits: 1,
				peak: score,
				firstHeardWindow: windowIndex,
				lastHitWindow: windowIndex
			});
			return;
		}

		track.peak = Math.max(track.peak, score);

		if (windowIndex - track.lastHitWindow >= this.rules.independenceGap) {
			track.hits++;
			track.lastHitWindow = windowIndex;
		}
	}
}
