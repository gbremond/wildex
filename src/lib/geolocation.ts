export type Position = { latitude: number; longitude: number };

/** A refused or slow fix is not an error here: callers carry on without a position. */
export async function currentPosition(): Promise<Position | null> {
	try {
		const { coords } = await new Promise<GeolocationPosition>((resolve, reject) =>
			navigator.geolocation.getCurrentPosition(resolve, reject, {
				timeout: 10_000,
				maximumAge: 300_000
			})
		);
		return { latitude: coords.latitude, longitude: coords.longitude };
	} catch {
		return null;
	}
}
