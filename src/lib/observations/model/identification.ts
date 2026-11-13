export type IdentificationMethod = 'photo' | 'sound' | 'manual';

export type IdentificationOptionId = 'camera' | 'gallery' | 'sound' | 'manual';

export type IdentificationOption = {
	id: IdentificationOptionId;
	method: IdentificationMethod;
	/**
	 * Asks the device for its camera. Android's photo picker offers the gallery
	 * only, so shooting and picking cannot be folded into one option.
	 */
	wantsCamera?: true;
};

export const IDENTIFICATION_OPTIONS: IdentificationOption[] = [
	{ id: 'camera', method: 'photo', wantsCamera: true },
	{ id: 'gallery', method: 'photo' },
	{ id: 'sound', method: 'sound' },
	{ id: 'manual', method: 'manual' }
];

const CAPTURE_ACCEPT: Record<IdentificationMethod, string | null> = {
	photo: 'image/*',
	sound: 'audio/*',
	manual: null
};

export function captureAccept(method: IdentificationMethod): string | null {
	return CAPTURE_ACCEPT[method];
}
