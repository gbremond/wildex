export type Species = {
	id: string;
	commonName: string;
	scientificName: string;
};

export function isSpecies(value: unknown): value is Species {
	return (
		typeof value === 'object' &&
		value !== null &&
		typeof (value as Species).id === 'string' &&
		typeof (value as Species).commonName === 'string' &&
		typeof (value as Species).scientificName === 'string'
	);
}
