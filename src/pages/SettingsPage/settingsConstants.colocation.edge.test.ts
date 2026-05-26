import { describe, expect, it } from 'vitest';
import {
	isAdminAiPublicStatsMode,
	normalizeAdminAiPublicStatsMode,
	type AdminAiPublicStatsMode,
} from '@/utils/adminAiStatsSettings';
import { MODES } from './constants';

describe('SettingsPage MODES constant (colocation)', () => {
	it('lists every supported public-stats mode exactly once', () => {
		expect(MODES).toEqual(['off', 'inline', 'live'] satisfies AdminAiPublicStatsMode[]);
		expect(new Set(MODES).size).toBe(MODES.length);
	});

	it.each(MODES)('mode %s is accepted by normalizeAdminAiPublicStatsMode', (mode) => {
		expect(normalizeAdminAiPublicStatsMode(mode)).toBe(mode);
		expect(isAdminAiPublicStatsMode(mode)).toBe(true);
	});

	it('rejects unknown raw values outside MODES', () => {
		expect(normalizeAdminAiPublicStatsMode('broadcast')).toBe('inline');
		expect(isAdminAiPublicStatsMode('broadcast')).toBe(false);
	});

	it('handles case-insensitive server strings for known modes', () => {
		expect(normalizeAdminAiPublicStatsMode('OFF')).toBe('off');
		expect(normalizeAdminAiPublicStatsMode(' Live ')).toBe('live');
	});
});
