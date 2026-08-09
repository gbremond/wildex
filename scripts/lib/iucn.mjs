import { fetchWithRetry } from './http.mjs';

const TAXA_URL = (genusName, speciesName) =>
	`https://api.iucnredlist.org/api/v4/taxa/scientific_name?genus_name=${encodeURIComponent(genusName)}&species_name=${encodeURIComponent(speciesName)}`;

const HEADERS = { 'User-Agent': 'Wildex (https://github.com/gbremond/wildex)' };

export const IUCN_CATEGORY_BY_CODE = {
	LC: 'LEAST_CONCERN',
	NT: 'NEAR_THREATENED',
	VU: 'VULNERABLE',
	EN: 'ENDANGERED',
	CR: 'CRITICALLY_ENDANGERED',
	EW: 'EXTINCT_IN_THE_WILD',
	EX: 'EXTINCT',
	DD: 'DATA_DEFICIENT'
};

export async function fetchIucnCategory(scientificName, token, fetchImpl = fetch) {
	const [genusName, speciesName] = scientificName.split(' ');
	const response = await fetchWithRetry(
		TAXA_URL(genusName, speciesName),
		{ headers: { ...HEADERS, Authorization: `Bearer ${token}` } },
		fetchImpl
	);

	if (!response.ok) return undefined;

	const { assessments } = await response.json();
	// Each scope (Global, Europe, Mediterranean, ...) can have its own "latest" assessment;
	// code "1" is Global, matching the worldwide category the app cites.
	const latest = assessments?.find(
		(assessment) => assessment.latest && assessment.scopes?.some((scope) => scope.code === '1')
	);
	const code = latest?.red_list_category_code;

	return IUCN_CATEGORY_BY_CODE[code];
}
