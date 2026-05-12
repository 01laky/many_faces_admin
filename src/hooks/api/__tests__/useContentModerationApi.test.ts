import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
	applyModerationDecision,
	applyBulkModeration,
	fetchModerationEvents,
	fetchModerationItems,
	fetchModerationMetrics,
	unwrapModerationMetricsResponse,
} from '../useContentModerationApi';

const mockRequest = vi.fn();

vi.mock('../../../api/core/request', () => ({
	request: (...args: unknown[]) => mockRequest(...args),
}));

vi.mock('../../../api/core/OpenAPI', () => ({
	OpenAPI: {
		BASE: 'http://localhost:8000',
		TOKEN: null,
	},
}));

describe('useContentModerationApi requests', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('fetches moderation items with filters', async () => {
		mockRequest.mockResolvedValue([]);

		await fetchModerationItems({
			contentType: 'Album',
			approvalStatus: 'PendingApproval',
			flagContains: 'spam',
			minConfidence: 0.5,
			minQueueAgeHours: 12,
		});

		expect(mockRequest).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({
				method: 'GET',
				url: '/api/contentmoderation',
				query: {
					contentType: 'Album',
					approvalStatus: 'PendingApproval',
					flagContains: 'spam',
					minConfidence: 0.5,
					minQueueAgeHours: 12,
				},
			})
		);
	});

	it('posts superadmin moderation decisions', async () => {
		mockRequest.mockResolvedValue({ approvalStatus: 'Approved' });

		await applyModerationDecision('Blog', 12, 'approve', { reason: 'Looks good' });

		expect(mockRequest).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({
				method: 'POST',
				url: '/api/contentmoderation/Blog/12/approve',
				body: { reason: 'Looks good' },
			})
		);
	});

	it('fetches moderation events for detail history', async () => {
		mockRequest.mockResolvedValue([]);

		await fetchModerationEvents('Reel', 44);

		expect(mockRequest).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({
				method: 'GET',
				url: '/api/contentmoderation/Reel/44/events',
			})
		);
	});

	it('fetches moderation metrics', async () => {
		mockRequest.mockResolvedValue({
			metrics: {
				pendingSubmissions: 0,
				aiQueuedJobs: 0,
				aiProcessingJobs: 0,
				aiFailedJobs: 0,
				approvedCount: 0,
				rejectedCount: 0,
				removedCount: 0,
				recommendedApproveCount: 0,
				recommendedRejectCount: 0,
				needsHumanReviewCount: 0,
				aiJobsLikelyTimeoutCount: 0,
				topModerationFlags: [],
				pendingSubmissionsByFace: [],
			},
			alerts: [{ code: 'ai_failed_jobs', severity: 'warning', message: '3 failed' }],
		});

		const result = await fetchModerationMetrics();

		expect(mockRequest).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({
				method: 'GET',
				url: '/api/contentmoderation/metrics',
			})
		);
		expect(result.pendingSubmissions).toBe(0);
		expect(result.alerts).toHaveLength(1);
		expect(result.alerts?.[0].code).toBe('ai_failed_jobs');
	});

	it('unwraps legacy flat metrics payloads', () => {
		const flat = unwrapModerationMetricsResponse({
			pendingSubmissions: 1,
			aiQueuedJobs: 0,
			aiProcessingJobs: 0,
			aiFailedJobs: 0,
			approvedCount: 0,
			rejectedCount: 0,
			removedCount: 0,
			recommendedApproveCount: 0,
			recommendedRejectCount: 0,
			needsHumanReviewCount: 0,
			aiJobsLikelyTimeoutCount: 0,
		});
		expect(flat.pendingSubmissions).toBe(1);
		expect(flat.topModerationFlags).toEqual([]);
		expect(flat.alerts).toEqual([]);
	});

	it('unwraps null or non-object metrics as empty snapshot', () => {
		const a = unwrapModerationMetricsResponse(null);
		expect(a.pendingSubmissions).toBe(0);
		expect(a.alerts).toEqual([]);

		const b = unwrapModerationMetricsResponse(undefined);
		expect(b.aiFailedJobs).toBe(0);

		const c = unwrapModerationMetricsResponse('unexpected');
		expect(c.recommendedApproveCount).toBe(0);
	});

	it('posts bulk moderation payloads', async () => {
		mockRequest.mockResolvedValue({ results: [] });

		await applyBulkModeration({
			action: 'Reject',
			items: [{ contentType: 'Blog', contentId: 12 }],
			reason: 'Shared reason',
		});

		expect(mockRequest).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({
				method: 'POST',
				url: '/api/contentmoderation/bulk',
				body: {
					action: 'Reject',
					items: [{ contentType: 'Blog', contentId: 12 }],
					reason: 'Shared reason',
				},
			})
		);
	});

	it('posts remove decision with reason body', async () => {
		mockRequest.mockResolvedValue({ approvalStatus: 'Removed' });

		await applyModerationDecision('Album', 99, 'remove', { reason: 'Policy violation' });

		expect(mockRequest).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({
				method: 'POST',
				url: '/api/contentmoderation/Album/99/remove',
				body: { reason: 'Policy violation' },
			})
		);
	});
});
