import { describe, expect, it } from 'vitest';
import { isReindexAlreadyRunningError } from '../useOperatorAiKnowledgeApi';
import { ApiError } from '@/api';

function makeApiError(status: number): ApiError {
	return new ApiError(
		{ method: 'POST', url: '/admin/api/operator-ai/knowledge/reindex' },
		{ url: '', ok: false, status, statusText: '', body: undefined },
		'reindex failed'
	);
}

describe('isReindexAlreadyRunningError', () => {
	it('returns true for a 409 ApiError (single-flight lock already held)', () => {
		expect(isReindexAlreadyRunningError(makeApiError(409))).toBe(true);
	});

	it('returns false for other ApiError statuses', () => {
		expect(isReindexAlreadyRunningError(makeApiError(500))).toBe(false);
		expect(isReindexAlreadyRunningError(makeApiError(403))).toBe(false);
	});

	it('returns false for non-ApiError values', () => {
		expect(isReindexAlreadyRunningError(new Error('boom'))).toBe(false);
		expect(isReindexAlreadyRunningError({ status: 409 })).toBe(false);
		expect(isReindexAlreadyRunningError(null)).toBe(false);
	});
});
