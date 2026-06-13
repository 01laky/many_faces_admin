import { describe, expect, it } from 'vitest';
import {
	buildBulkModerationPayload,
	buildModerationRowKey,
	canRunBulkModeration,
	getModerationQueueLabel,
	getModerationStatusChipTone,
	isPendingModeration,
	parseModerationRowKey,
} from '../contentModeration';

describe('album detail moderation helpers', () => {
	it('isPendingModeration is true only for PendingApproval', () => {
		expect(isPendingModeration('PendingApproval')).toBe(true);
		expect(isPendingModeration('Approved')).toBe(false);
	});

	it('getModerationQueueLabel uses one summary for approved albums', () => {
		expect(getModerationQueueLabel('Approved', 'NotQueued')).toBe('Approved');
	});

	it('getModerationStatusChipTone maps approval enum', () => {
		expect(getModerationStatusChipTone('Approved')).toBe('approved');
		expect(getModerationStatusChipTone('PendingApproval')).toBe('pending');
	});
});

describe('buildModerationRowKey', () => {
	it('joins content type and numeric id', () => {
		expect(buildModerationRowKey({ contentType: 'Album', contentId: 42 })).toBe('Album:42');
	});

	it('supports zero content id', () => {
		expect(buildModerationRowKey({ contentType: 'Reel', contentId: 0 })).toBe('Reel:0');
	});
});

describe('parseModerationRowKey', () => {
	it('round-trips keys from buildModerationRowKey', () => {
		const key = buildModerationRowKey({ contentType: 'Blog', contentId: 99 });
		expect(parseModerationRowKey(key)).toEqual({ contentType: 'Blog', contentId: 99 });
	});

	it('returns null for empty or malformed keys', () => {
		expect(parseModerationRowKey('')).toBeNull();
		expect(parseModerationRowKey('no-colon')).toBeNull();
		expect(parseModerationRowKey('Album:not-a-number')).toBeNull();
	});

	it('returns null when the id segment is missing or blank (Number("") === 0 guard)', () => {
		// Regression: a key with an empty id parsed to a deceptively valid contentId 0.
		expect(parseModerationRowKey('Album:')).toBeNull();
		expect(parseModerationRowKey('Album:   ')).toBeNull();
	});

	it('still accepts a literal zero content id (symmetric with buildModerationRowKey)', () => {
		expect(parseModerationRowKey('Reel:0')).toEqual({ contentType: 'Reel', contentId: 0 });
	});
});

describe('buildBulkModerationPayload', () => {
	it('skips malformed keys instead of posting invalid items', () => {
		const payload = buildBulkModerationPayload('Approve', ['Album:1', 'bad', 'Blog:2'], ' ok ');
		expect(payload.items).toEqual([
			{ contentType: 'Album', contentId: 1 },
			{ contentType: 'Blog', contentId: 2 },
		]);
		expect(payload.reason).toBe('ok');
	});
});

describe('canRunBulkModeration', () => {
	it('is false when nothing is selected or mutation is pending', () => {
		expect(canRunBulkModeration(0, false)).toBe(false);
		expect(canRunBulkModeration(2, true)).toBe(false);
	});

	it('is true when rows are selected and mutation is idle', () => {
		expect(canRunBulkModeration(3, false)).toBe(true);
	});
});
