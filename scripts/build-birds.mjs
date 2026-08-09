#!/usr/bin/env node

// Rebuilds static/birds.json from a TAXREF release (https://inpn.mnhn.fr/telechargement/referentielEspece/taxref).
// Usage: IUCN_API_TOKEN=<token> node scripts/build-birds.mjs ~/Downloads/TAXREF_v18_2025
// IUCN_API_TOKEN: free token from https://api.iucnredlist.org/

import { createReadStream } from 'node:fs';
import { readdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';
import { fetchDescription } from './lib/wikipedia.mjs';
import { fetchIucnCategory } from './lib/iucn.mjs';

const OUTPUT_FILE = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'static', 'birds.json');

const BIRD_CLASS = 'Aves';
const SPECIES_RANK = 'ES';
const METROPOLITAN_FRANCE = 'FR';
const AVIBASE = 'Avibase';
const AVIBASE_ID = /avibaseid=([0-9A-Za-z]+)/;

const STATUS_BY_CODE = {
	P: 'NATIVE',
	E: 'ENDEMIC',
	S: 'SUBENDEMIC',
	I: 'INTRODUCED',
	J: 'INVASIVE',
	B: 'OCCASIONAL'
};

const HABITAT_BY_CODE = {
	1: 'MARINE',
	2: 'FRESHWATER',
	3: 'TERRESTRIAL',
	4: 'MARINE_AND_FRESHWATER',
	5: 'MARINE_AND_TERRESTRIAL',
	6: 'BRACKISH',
	7: 'CONTINENTAL',
	8: 'TERRESTRIAL_AND_FRESHWATER'
};

function unquote(field) {
	if (!field.startsWith('"')) return field;
	return field.slice(1, -1).replaceAll('""', '"');
}

function splitRow(line) {
	return line.split('\t').map(unquote);
}

// TAXREF_LIENS.txt holds a handful of records broken across physical lines; they are
// dropped by the column-count guard because no Avibase record is among them.
async function* readRows(filePath, keepLine = () => true) {
	const lines = createInterface({
		input: createReadStream(filePath, { encoding: 'utf8' }),
		crlfDelay: Infinity
	});

	let columns = null;

	for await (const line of lines) {
		if (!columns) {
			columns = splitRow(line);
			continue;
		}

		if (!keepLine(line)) continue;

		const values = splitRow(line);
		if (values.length !== columns.length) continue;

		yield Object.fromEntries(columns.map((column, index) => [column, values[index]]));
	}
}

async function findTaxrefFile(directory) {
	const entries = await readdir(directory);
	const taxref = entries.find((entry) => /^TAXREFv\d+\.txt$/.test(entry));

	if (!taxref) throw new Error(`No TAXREFv<version>.txt in ${directory}`);

	return join(directory, taxref);
}

function isFrenchBirdSpecies(row) {
	return (
		row.CLASSE === BIRD_CLASS &&
		row.RANG === SPECIES_RANK &&
		row.CD_NOM === row.CD_REF &&
		Object.hasOwn(STATUS_BY_CODE, row[METROPOLITAN_FRANCE])
	);
}

function toHabitat(code, scientificName) {
	const habitat = HABITAT_BY_CODE[code];

	if (!habitat) throw new Error(`Unknown TAXREF habitat "${code}" for ${scientificName}`);

	return habitat;
}

// TAXREF packs alternative vernacular names into one comma-separated field
// ("Effraie des clochers, Chouette effraie"); only the canonical first one is kept.
function preferredName(vernacularNames, scientificName) {
	return vernacularNames.split(',')[0].trim() || scientificName;
}

function toBird(row) {
	return {
		id: row.CD_REF,
		scientificName: row.LB_NOM,
		frenchName: preferredName(row.NOM_VERN, row.LB_NOM),
		englishName: preferredName(row.NOM_VERN_ENG, row.LB_NOM),
		order: row.ORDRE,
		family: row.FAMILLE,
		habitat: toHabitat(row.HABITAT, row.LB_NOM),
		status: STATUS_BY_CODE[row[METROPOLITAN_FRANCE]]
	};
}

async function readBirds(taxrefFile) {
	const birds = [];

	for await (const row of readRows(taxrefFile)) {
		if (isFrenchBirdSpecies(row)) birds.push(toBird(row));
	}

	return birds.sort((left, right) => left.scientificName.localeCompare(right.scientificName));
}

async function readAvibaseIds(linksFile, birdIds) {
	const avibaseIds = new Map();
	const isAvibaseLine = (line) => line.includes(`"${AVIBASE}"`);

	for await (const row of readRows(linksFile, isAvibaseLine)) {
		if (row.CT_NAME !== AVIBASE || !birdIds.has(row.CD_NOM)) continue;

		const [, avibaseId] = AVIBASE_ID.exec(row.URL_SP) ?? [];
		if (avibaseId) avibaseIds.set(row.CD_NOM, avibaseId);
	}

	return avibaseIds;
}

async function mapWithConcurrency(items, limit, mapper) {
	const results = new Array(items.length);
	let nextIndex = 0;

	async function worker() {
		while (nextIndex < items.length) {
			const index = nextIndex++;
			results[index] = await mapper(items[index]);
		}
	}

	await Promise.all(Array.from({ length: limit }, worker));

	return results;
}

async function enrichBirds(birds, iucnToken) {
	let completed = 0;
	let iucnHits = 0;
	let descriptionHits = 0;

	await mapWithConcurrency(birds, 3, async (bird) => {
		const [description, iucnCategory] = await Promise.all([
			fetchDescription(bird.scientificName).catch(() => undefined),
			fetchIucnCategory(bird.scientificName, iucnToken).catch(() => undefined)
		]);

		if (description) {
			bird.description = description;
			descriptionHits++;
		}
		if (iucnCategory) {
			bird.iucnCategory = iucnCategory;
			iucnHits++;
		}

		completed++;
		process.stdout.write(
			`\renriching ${completed}/${birds.length} (iucn ${iucnHits}, description ${descriptionHits})`
		);
	});

	process.stdout.write('\n');
}

function countBy(birds, field) {
	const counts = new Map();

	birds.forEach((bird) => counts.set(bird[field], (counts.get(bird[field]) ?? 0) + 1));

	return [...counts]
		.sort((left, right) => right[1] - left[1])
		.map(([value, count]) => `${value}=${count}`)
		.join(' ');
}

function report(birds) {
	const distinct = (field) => new Set(birds.map((bird) => bird[field])).size;
	const named = (bird) => bird.frenchName !== bird.scientificName;

	console.log(`${birds.length} birds → ${OUTPUT_FILE}`);
	console.log(`  status   ${countBy(birds, 'status')}`);
	console.log(`  habitat  ${countBy(birds, 'habitat')}`);
	console.log(`  taxonomy ${distinct('order')} orders, ${distinct('family')} families`);
	console.log(`  avibase  ${birds.filter((bird) => bird.avibaseId).length}/${birds.length}`);
	console.log(`  iucn     ${birds.filter((bird) => bird.iucnCategory).length}/${birds.length}`);
	console.log(`  description ${birds.filter((bird) => bird.description).length}/${birds.length}`);
	console.log(`  fallback ${birds.filter((bird) => !named(bird)).length} without a French name`);
}

async function main() {
	const [taxrefDirectory] = process.argv.slice(2);

	if (!taxrefDirectory) {
		throw new Error('Usage: node scripts/build-birds.mjs <taxref-directory>');
	}

	const iucnToken = process.env.IUCN_API_TOKEN;
	if (!iucnToken) {
		throw new Error('Usage: IUCN_API_TOKEN=<token> node scripts/build-birds.mjs <taxref-directory>');
	}

	const birds = await readBirds(await findTaxrefFile(taxrefDirectory));
	const avibaseIds = await readAvibaseIds(
		join(taxrefDirectory, 'TAXREF_LIENS.txt'),
		new Set(birds.map((bird) => bird.id))
	);

	birds.forEach((bird) => {
		const avibaseId = avibaseIds.get(bird.id);
		if (avibaseId) bird.avibaseId = avibaseId;
	});

	await enrichBirds(birds, iucnToken);

	await writeFile(OUTPUT_FILE, `${JSON.stringify(birds, null, '\t')}\n`);
	report(birds);
}

await main();
