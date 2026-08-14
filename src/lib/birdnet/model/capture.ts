import { SAMPLE_RATE } from './chunks';

export class SampleRateError extends Error {
	constructor(actual: number) {
		super(
			`Audio decoded at ${actual} Hz but BirdNET needs ${SAMPLE_RATE} Hz. ` +
				`Resampling failed — results would silently name the wrong species.`
		);
		this.name = 'SampleRateError';
	}
}

/**
 * iOS Safari ignores `new AudioContext({ sampleRate })` and hands back 44.1 kHz.
 * Feeding those samples to the model shifts every frequency up by 8.8%, which
 * does not throw — it confidently returns a neighbouring species. So decoding
 * always goes through an OfflineAudioContext pinned to 48 kHz, and the result
 * is checked rather than trusted.
 */
export async function decodeTo48kMono(data: ArrayBuffer): Promise<Float32Array> {
	const decoder = new AudioContext();
	let decoded: AudioBuffer;
	try {
		decoded = await decoder.decodeAudioData(data);
	} finally {
		void decoder.close();
	}

	const resampler = new OfflineAudioContext(
		1,
		Math.ceil(decoded.duration * SAMPLE_RATE),
		SAMPLE_RATE
	);
	const source = resampler.createBufferSource();
	source.buffer = decoded;
	source.connect(resampler.destination);
	source.start();

	const rendered = await resampler.startRendering();
	if (rendered.sampleRate !== SAMPLE_RATE) throw new SampleRateError(rendered.sampleRate);

	return rendered.getChannelData(0);
}

export type MicrophoneEnvironment = {
	origin: string;
	secureContext: boolean;
	hasMediaDevices: boolean;
	/** 'granted' | 'denied' | 'prompt', or why we could not ask. */
	permission: string;
};

/**
 * A refusal can come from the origin, from Chrome's site settings or from
 * Android itself, and getUserMedia alone cannot tell them apart. Reading each
 * layer separately is what makes the failing one obvious.
 */
export async function microphoneEnvironment(): Promise<MicrophoneEnvironment> {
	return {
		origin: location.origin,
		secureContext: window.isSecureContext,
		hasMediaDevices: Boolean(navigator.mediaDevices?.getUserMedia),
		permission: await microphonePermission()
	};
}

async function microphonePermission(): Promise<string> {
	if (!navigator.permissions) return 'no Permissions API';
	try {
		const status = await navigator.permissions.query({
			name: 'microphone' as PermissionName
		});
		return status.state;
	} catch {
		// Safari does not accept 'microphone' as a permission name.
		return 'not queryable';
	}
}

/** Voice-processing defaults are tuned for speech and will shred birdsong. */
export const MICROPHONE_CONSTRAINTS: MediaStreamConstraints = {
	audio: {
		channelCount: 1,
		echoCancellation: false,
		noiseSuppression: false,
		autoGainControl: false
	}
};

export async function recordFromMicrophone(seconds: number): Promise<ArrayBuffer> {
	if (!navigator.mediaDevices?.getUserMedia) {
		throw new Error(
			'No microphone API. getUserMedia needs a secure context — over a LAN IP ' +
				'you must serve HTTPS (e.g. `cloudflared tunnel --url http://localhost:5173`).'
		);
	}

	const stream = await navigator.mediaDevices.getUserMedia(MICROPHONE_CONSTRAINTS);
	const recorder = new MediaRecorder(stream);
	const parts: Blob[] = [];
	recorder.ondataavailable = (event) => parts.push(event.data);

	const recorded = new Promise<Blob>((resolve) => {
		recorder.onstop = () => resolve(new Blob(parts, { type: recorder.mimeType }));
	});

	recorder.start();
	setTimeout(() => recorder.stop(), seconds * 1000);

	const blob = await recorded;
	for (const track of stream.getTracks()) track.stop();

	if (blob.size === 0) {
		throw new Error(
			'The microphone produced an empty recording. This is a known iOS bug for ' +
				'home-screen web apps — try the same page in the Safari tab.'
		);
	}

	return blob.arrayBuffer();
}
