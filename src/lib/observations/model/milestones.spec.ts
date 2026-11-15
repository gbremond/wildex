import { describe, expect, it } from 'vitest';
import { firstSightings, lifeListSize } from './milestones';
import type { Observation, ObservedSpecies } from './observation';

const kingfisher = { name: 'Martin-pêcheur', speciesId: '3571', scientificName: 'Alcedo atthis' };
const egret = { name: 'Aigrette garzette', speciesId: '2622', scientificName: 'Egretta garzetta' };

function sighting(species: ObservedSpecies): Observation {
	return {
		id: crypto.randomUUID(),
		species,
		observedAt: new Date(2026, 10, 13, 9, 0).toISOString(),
		position: null,
		tripId: null,
		method: 'manual',
		notes: '',
		capture: null
	};
}

describe('firstSightings', () => {
	it('is the species never logged before', () => {
		const saved = sighting(kingfisher);

		expect(firstSightings([saved], [sighting(egret)])).toEqual([saved]);
	});

	it('is nothing when the species is already in the journal', () => {
		expect(firstSightings([sighting(kingfisher)], [sighting(kingfisher)])).toEqual([]);
	});

	it('recognises a listed species by its id, whatever its name', () => {
		const renamed = { ...kingfisher, name: "Martin-pêcheur d'Europe" };

		expect(firstSightings([sighting(renamed)], [sighting(kingfisher)])).toEqual([]);
	});

	it('recognises an unlisted species by its name, whatever its case', () => {
		const saved = sighting({ name: 'Goéland leucophée' });

		expect(firstSightings([saved], [sighting({ name: 'goéland Leucophée' })])).toEqual([]);
	});

	it('counts every new species of a listening session', () => {
		const saved = [sighting(kingfisher), sighting(egret)];

		expect(firstSightings(saved, [])).toEqual(saved);
	});
});

describe('lifeListSize', () => {
	it('counts each species once, however often it was seen', () => {
		const journal = [
			sighting(kingfisher),
			sighting(kingfisher),
			sighting({ name: 'Some odd gull' })
		];

		expect(lifeListSize(journal)).toBe(2);
	});
});
