import { describe, expect, it } from 'vitest';
import {
	adminAiPublicStatsDefaults,
	isAdminAiPublicStatsMode,
	normalizeAdminAiPublicStatsMode,
} from '../adminAiStatsSettings';

describe('adminAiStatsSettings', () => {
	it('defaults to inline when value is missing', () => {
		expect(normalizeAdminAiPublicStatsMode(undefined)).toBe(
			adminAiPublicStatsDefaults.DEFAULT_MODE
		);
	});

	it.each(['inline', 'live'] as const)('normalizes valid mode %s', (mode) => {
		expect(normalizeAdminAiPublicStatsMode(mode)).toBe(mode);
	});

	it('treats unknown values as inline (safe default)', () => {
		expect(normalizeAdminAiPublicStatsMode('banana')).toBe('inline');
	});

	it('treats case-insensitive valid tokens', () => {
		expect(normalizeAdminAiPublicStatsMode('INLINE')).toBe('inline');
	});

	it('isAdminAiPublicStatsMode guards valid tokens', () => {
		expect(isAdminAiPublicStatsMode('live')).toBe(true);
		expect(isAdminAiPublicStatsMode('nope')).toBe(false);
	});
});
