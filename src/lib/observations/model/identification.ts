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
	label: string;
	hint: string;
};

export const IDENTIFICATION_OPTIONS: IdentificationOption[] = [
	{
		id: 'camera',
		method: 'photo',
		wantsCamera: true,
		label: 'Take a picture',
		hint: 'Shoot now, with BioCLIP v2'
	},
	{
		id: 'gallery',
		method: 'photo',
		label: 'Pick a picture',
		hint: 'From the gallery, with BioCLIP v2'
	},
	{
		id: 'sound',
		method: 'sound',
		label: 'Listen',
		hint: 'Identify birds by their calls, with BirdNET'
	},
	{
		id: 'manual',
		method: 'manual',
		label: 'From scratch',
		hint: 'Name the species yourself'
	}
];

const CAPTURE_ACCEPT: Record<IdentificationMethod, string | null> = {
	photo: 'image/*',
	sound: 'audio/*',
	manual: null
};

export function captureAccept(method: IdentificationMethod): string | null {
	return CAPTURE_ACCEPT[method];
}
