import { m } from '$lib/paraglide/messages';
import type { IdentificationOptionId } from '../model/identification';

type Copy = { label: () => string; hint: () => string };

export const IDENTIFICATION_COPY: Record<IdentificationOptionId, Copy> = {
	camera: { label: m.identification_camera_label, hint: m.identification_camera_hint },
	gallery: { label: m.identification_gallery_label, hint: m.identification_gallery_hint },
	sound: { label: m.identification_sound_label, hint: m.identification_sound_hint },
	manual: { label: m.identification_manual_label, hint: m.identification_manual_hint }
};
