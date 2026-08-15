/** Voice-processing defaults are tuned for speech and will shred birdsong. */
export const MICROPHONE_CONSTRAINTS: MediaStreamConstraints = {
	audio: {
		channelCount: 1,
		echoCancellation: false,
		noiseSuppression: false,
		autoGainControl: false
	}
};

export async function openMicrophone(): Promise<MediaStream> {
	if (!navigator.mediaDevices?.getUserMedia) {
		throw new Error(
			'No microphone API. getUserMedia needs a secure context — over a LAN IP ' +
				'you must serve HTTPS (e.g. `cloudflared tunnel --url http://localhost:5173`).'
		);
	}

	return navigator.mediaDevices.getUserMedia(MICROPHONE_CONSTRAINTS);
}
