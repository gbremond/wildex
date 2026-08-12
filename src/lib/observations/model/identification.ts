export type IdentificationMethod = 'photo' | 'sound' | 'manual';

export type IdentificationOption = {
	method: IdentificationMethod;
	label: string;
	hint: string;
};

export const IDENTIFICATION_OPTIONS: IdentificationOption[] = [
	{ method: 'photo', label: 'Add a picture', hint: 'Identify the species with BioCLIP v2' },
	{ method: 'sound', label: 'Add a sound', hint: 'Identify the bird call with BirdNet' },
	{ method: 'manual', label: 'From scratch', hint: 'Name the species yourself' }
];

const CAPTURE_ACCEPT: Record<IdentificationMethod, string | null> = {
	photo: 'image/*',
	sound: 'audio/*',
	manual: null
};

export function captureAccept(method: IdentificationMethod): string | null {
	return CAPTURE_ACCEPT[method];
}

export function identificationOption(method: IdentificationMethod): IdentificationOption {
	return IDENTIFICATION_OPTIONS.find((option) => option.method === method)!;
}
