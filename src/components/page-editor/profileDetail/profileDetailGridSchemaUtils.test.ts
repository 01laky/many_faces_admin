import { describe, expect, it } from 'vitest';
import { DEFAULT_PROFILE_DETAIL_GRID_SCHEMA } from './defaultProfileDetailSchema';
import { PROFILE_DETAIL_SECTION_TYPES } from './profileDetailGridTypes';
import {
	parseProfileDetailGridSchema,
	serializeProfileDetailGridSchema,
} from './profileDetailGridSchemaUtils';

describe('profileDetailGridSchemaUtils', () => {
	it('falls back to the default schema when persisted JSON is missing or invalid', () => {
		expect(parseProfileDetailGridSchema(null)).toEqual(DEFAULT_PROFILE_DETAIL_GRID_SCHEMA);
		expect(parseProfileDetailGridSchema('')).toEqual(DEFAULT_PROFILE_DETAIL_GRID_SCHEMA);
		expect(parseProfileDetailGridSchema('{not-json')).toEqual(DEFAULT_PROFILE_DETAIL_GRID_SCHEMA);
	});

	it('serializes a complete default schema when the editor has not emitted a value yet', () => {
		const parsed = JSON.parse(serializeProfileDetailGridSchema(null));

		expect(parsed.schemaVersion).toBe(1);
		expect(parsed.items).toEqual(DEFAULT_PROFILE_DETAIL_GRID_SCHEMA.items);
		expect(parsed.breakpoints).toEqual(DEFAULT_PROFILE_DETAIL_GRID_SCHEMA.breakpoints);
		expect(parsed.cols).toEqual(DEFAULT_PROFILE_DETAIL_GRID_SCHEMA.cols);
		expect(parsed.rowHeight).toBe(DEFAULT_PROFILE_DETAIL_GRID_SCHEMA.rowHeight);
	});

	it('forces schemaVersion one while preserving edited profile detail sections', () => {
		const edited = {
			...DEFAULT_PROFILE_DETAIL_GRID_SCHEMA,
			schemaVersion: 99,
			items: [
				{
					i: 'back',
					x: 0,
					y: 0,
					w: 12,
					h: 1,
					sectionType: 'profileBackNav' as const,
				},
			],
		};

		const parsed = JSON.parse(serializeProfileDetailGridSchema(edited));

		expect(parsed.schemaVersion).toBe(1);
		expect(parsed.items).toEqual(edited.items);
	});

	it('exposes every backend-supported profile detail section type to the picker', () => {
		expect(PROFILE_DETAIL_SECTION_TYPES).toEqual([
			'profileBackNav',
			'profileHero',
			'profileMeta',
			'profileActions',
			'profileComments',
			'profileReviews',
			'userAlbums',
			'userBlogs',
			'userReels',
			'userStories',
			'spacer',
		]);
	});
});
