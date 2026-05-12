import { describe, expect, it } from 'vitest';
import {
	buildBulkModerationPayload,
	dashboardHasOperationalWarnings,
	formatOptionalDate,
	getModerationQueueLabel,
	isSuperAdminFromToken,
	parseModerationFlags,
	shouldWarnAboutOldestPending,
} from '../contentModeration';

function makeToken(payload: Record<string, unknown>) {
	return `header.${btoa(JSON.stringify(payload))}.signature`;
}

describe('admin content moderation helpers', () => {
	it('detects SUPER_ADMIN role from token role claim', () => {
		expect(isSuperAdminFromToken(makeToken({ role: 'SUPER_ADMIN' }))).toBe(true);
		expect(isSuperAdminFromToken(makeToken({ role: 'ADMIN' }))).toBe(false);
		expect(isSuperAdminFromToken(makeToken({ roles: ['USER', 'SUPER_ADMIN'] }))).toBe(true);
		expect(isSuperAdminFromToken('not-a-jwt')).toBe(false);
	});

	it.each([
		['PendingApproval', 'RecommendedApprove', 'AI recommended approval'],
		['PendingApproval', 'RecommendedReject', 'AI recommended rejection'],
		['PendingApproval', 'NeedsHumanReview', 'Needs human review'],
		['Approved', 'Queued', 'Approved'],
		['Removed', 'Failed', 'Removed'],
	] as const)('maps %s/%s to queue label', (approvalStatus, aiReviewStatus, expected) => {
		expect(getModerationQueueLabel(approvalStatus, aiReviewStatus)).toBe(expected);
	});

	it('parses moderation flags safely', () => {
		expect(parseModerationFlags('["spam","adult",1]')).toEqual(['spam', 'adult']);
		expect(parseModerationFlags('not-json')).toEqual([]);
		expect(parseModerationFlags(null)).toEqual([]);
	});

	it('formats optional dates without throwing', () => {
		expect(formatOptionalDate(null)).toBe('Not set');
		expect(formatOptionalDate('not-date')).toBe('Invalid date');
		expect(formatOptionalDate('2026-05-12T10:00:00Z')).toContain('2026');
	});

	it('builds bulk moderation payloads from selected row keys', () => {
		expect(
			buildBulkModerationPayload('Reject', ['Blog:12', 'Reel:33'], '  Shared reason  ')
		).toEqual({
			action: 'Reject',
			items: [
				{ contentType: 'Blog', contentId: 12 },
				{ contentType: 'Reel', contentId: 33 },
			],
			reason: 'Shared reason',
			userMessage: undefined,
		});
	});

	it('warns when oldest pending content exceeds operational threshold', () => {
		expect(shouldWarnAboutOldestPending(24)).toBe(true);
		expect(shouldWarnAboutOldestPending(2)).toBe(false);
		expect(shouldWarnAboutOldestPending(null)).toBe(false);
	});

	it('detects dashboard operational warnings from queue, AI failures, or alert severity', () => {
		expect(
			dashboardHasOperationalWarnings({
				oldestPendingAgeHours: 30,
				aiFailedJobs: 0,
				alerts: [],
			})
		).toBe(true);
		expect(
			dashboardHasOperationalWarnings({
				oldestPendingAgeHours: 1,
				aiFailedJobs: 2,
				alerts: [],
			})
		).toBe(true);
		expect(
			dashboardHasOperationalWarnings({
				oldestPendingAgeHours: 1,
				aiFailedJobs: 0,
				alerts: [{ severity: 'info', message: '' }],
			})
		).toBe(false);
		expect(
			dashboardHasOperationalWarnings({
				oldestPendingAgeHours: 1,
				aiFailedJobs: 0,
				alerts: [{ severity: 'Warning', message: 'x' }],
			})
		).toBe(true);
	});
});
