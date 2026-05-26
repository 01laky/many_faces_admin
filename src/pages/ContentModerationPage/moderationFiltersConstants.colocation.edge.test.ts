import { describe, expect, it } from 'vitest';
import type {
	AiReviewRiskLevel,
	ContentApprovalStatus,
	ModeratedContentType,
} from '@/utils/contentModeration';
import { APPROVAL_FILTERS, CONTENT_TYPES, RISK_FILTERS } from './constants';

function unique<T>(values: readonly T[]): T[] {
	return [...new Set(values)];
}

describe('ContentModerationPage filter constants (colocation)', () => {
	it('APPROVAL_FILTERS includes empty option and every backend approval status', () => {
		expect(APPROVAL_FILTERS[APPROVAL_FILTERS.length - 1]).toBe('');
		const statuses = APPROVAL_FILTERS.filter((v): v is ContentApprovalStatus => v !== '');
		expect(statuses).toEqual([
			'PendingApproval',
			'Approved',
			'Rejected',
			'Removed',
		] satisfies ContentApprovalStatus[]);
	});

	it('CONTENT_TYPES includes empty option and every moderated content type', () => {
		expect(CONTENT_TYPES[CONTENT_TYPES.length - 1]).toBe('');
		const types = CONTENT_TYPES.filter((v): v is ModeratedContentType => v !== '');
		expect(types).toEqual(['Album', 'Blog', 'Reel'] satisfies ModeratedContentType[]);
	});

	it('RISK_FILTERS includes empty option and every risk level', () => {
		expect(RISK_FILTERS[0]).toBe('High');
		expect(RISK_FILTERS[RISK_FILTERS.length - 1]).toBe('');
		const levels = RISK_FILTERS.filter((v): v is AiReviewRiskLevel => v !== '');
		expect(levels).toEqual(['High', 'Medium', 'Low', 'Unknown'] satisfies AiReviewRiskLevel[]);
	});

	it.each([
		['APPROVAL_FILTERS', APPROVAL_FILTERS],
		['CONTENT_TYPES', CONTENT_TYPES],
		['RISK_FILTERS', RISK_FILTERS],
	] as const)('%s has no duplicate entries', (_label, values) => {
		expect(unique(values)).toHaveLength(values.length);
	});

	it('filter arrays never contain whitespace-only sentinel values', () => {
		for (const values of [APPROVAL_FILTERS, CONTENT_TYPES, RISK_FILTERS]) {
			for (const value of values) {
				if (value !== '') {
					expect(value.trim()).toBe(value);
					expect(value.length).toBeGreaterThan(0);
				}
			}
		}
	});
});
