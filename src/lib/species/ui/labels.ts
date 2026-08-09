import type { Habitat, IucnCategory, Status } from '../model/model';

export function readableLabel(value: Habitat | Status | IucnCategory): string {
	const words = value.toLowerCase().replaceAll('_', ' ');

	return words.charAt(0).toUpperCase() + words.slice(1);
}
