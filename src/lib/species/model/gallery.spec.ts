import { describe, expect, it } from 'vitest';
import {
	MAX_GALLERY_PHOTOS,
	galleryPhotosFrom,
	matchingTaxonId,
	type InaturalistPhoto,
	type InaturalistTaxon
} from './gallery';

function photo(overrides: Partial<InaturalistPhoto> = {}): InaturalistPhoto {
	return {
		id: 61266631,
		license_code: 'cc-by-nc-sa',
		attribution_name: 'Mark Kilner',
		medium_url: 'https://inaturalist-open-data.s3.amazonaws.com/photos/61266631/medium.jpg',
		large_url: 'https://inaturalist-open-data.s3.amazonaws.com/photos/61266631/large.jpg',
		flags: [],
		...overrides
	};
}

function taxon(overrides: Partial<InaturalistTaxon> = {}): InaturalistTaxon {
	return { id: 2599, name: 'Alcedo atthis', rank: 'species', is_active: true, ...overrides };
}

describe('galleryPhotosFrom', () => {
	it('credits the photographer and the licence', () => {
		expect(galleryPhotosFrom([{ photo: photo() }])).toEqual([
			{
				id: 61266631,
				url: 'https://inaturalist-open-data.s3.amazonaws.com/photos/61266631/medium.jpg',
				largeUrl: 'https://inaturalist-open-data.s3.amazonaws.com/photos/61266631/large.jpg',
				credit: '© Mark Kilner · CC BY-NC-SA'
			}
		]);
	});

	it('leaves out photos with all rights reserved', () => {
		expect(galleryPhotosFrom([{ photo: photo({ license_code: null }) }])).toEqual([]);
	});

	it('leaves out photos flagged by the community', () => {
		const flagged = photo({ flags: [{ flag: 'copyright infringement' }] });

		expect(galleryPhotosFrom([{ photo: flagged }])).toEqual([]);
	});

	it(`keeps at most ${MAX_GALLERY_PHOTOS} photos`, () => {
		const many = Array.from({ length: 12 }, (_, id) => ({ photo: photo({ id }) }));

		expect(galleryPhotosFrom(many)).toHaveLength(MAX_GALLERY_PHOTOS);
	});
});

describe('matchingTaxonId', () => {
	it('is the active species with exactly this scientific name', () => {
		const results = [taxon({ id: 1, name: 'Alcedo atthis bengalensis', rank: 'subspecies' }), taxon()];

		expect(matchingTaxonId(results, 'alcedo Atthis')).toBe(2599);
	});

	it('ignores a taxon that is no longer active', () => {
		expect(matchingTaxonId([taxon({ is_active: false })], 'Alcedo atthis')).toBeUndefined();
	});

	it('is nothing when the search only found other species', () => {
		expect(matchingTaxonId([taxon({ name: 'Alcedo meninting' })], 'Alcedo atthis')).toBeUndefined();
	});
});
