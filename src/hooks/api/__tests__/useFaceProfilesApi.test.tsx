// @vitest-environment happy-dom
import type { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestQueryClient } from './testUtils';
import {
	faceProfilesKeys,
	useDeleteFaceProfileComment,
	useDeleteFaceProfileReview,
} from '../useFaceProfilesApi';

/**
 * ADPM-U6 (admin-face-profile-detail-management-agent-prompt.md §9.1) — deleting a profile
 * comment or review must invalidate both the whole `faceProfiles` tree (so the paginated
 * comments/reviews lists refetch) and the specific profile detail key (so the counters update).
 * The generated OpenAPI transport is mocked, matching the other hooks/api tests.
 */

const mockRequest = vi.fn();

vi.mock('../../../api/core/request', () => ({
	request: (...args: unknown[]) => mockRequest(...args),
}));

vi.mock('../../../api/core/OpenAPI', () => ({
	OpenAPI: { BASE: 'http://localhost:8000', TOKEN: null },
}));

const payload = { faceId: 7, reason: 'Abusive language', userMessage: 'Please stay civil.' };

function wrapperWithSpy() {
	const client = createTestQueryClient();
	const invalidate = vi.spyOn(client, 'invalidateQueries');
	const wrapper = ({ children }: { children: ReactNode }) => (
		<QueryClientProvider client={client}>{children}</QueryClientProvider>
	);
	return { wrapper, invalidate };
}

describe('useFaceProfilesApi delete mutations', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockRequest.mockResolvedValue(undefined);
	});

	it('ADPM-U6: deleting a comment posts to the operator route and invalidates the profile keys', async () => {
		const { wrapper, invalidate } = wrapperWithSpy();
		const { result } = renderHook(() => useDeleteFaceProfileComment(7, 'user-9'), { wrapper });

		await result.current.mutateAsync({ commentId: 55, payload });

		expect(mockRequest).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({
				method: 'POST',
				url: '/api/operator-content/profile-comments/55/delete',
				body: payload,
			})
		);

		await waitFor(() => expect(invalidate).toHaveBeenCalledTimes(2));
		expect(invalidate).toHaveBeenCalledWith({ queryKey: faceProfilesKeys.all });
		expect(invalidate).toHaveBeenCalledWith({
			queryKey: faceProfilesKeys.detail(7, 'user-9'),
		});
	});

	it('ADPM-U6: deleting a review invalidates the same keys', async () => {
		const { wrapper, invalidate } = wrapperWithSpy();
		const { result } = renderHook(() => useDeleteFaceProfileReview(7, 'user-9'), { wrapper });

		await result.current.mutateAsync({ reviewId: 66, payload });

		expect(mockRequest).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({
				method: 'POST',
				url: '/api/operator-content/profile-reviews/66/delete',
			})
		);

		await waitFor(() => expect(invalidate).toHaveBeenCalledTimes(2));
		expect(invalidate).toHaveBeenCalledWith({ queryKey: faceProfilesKeys.all });
		expect(invalidate).toHaveBeenCalledWith({
			queryKey: faceProfilesKeys.detail(7, 'user-9'),
		});
	});

	it('ADPM-U6: a failed delete does not invalidate anything', async () => {
		const { wrapper, invalidate } = wrapperWithSpy();
		mockRequest.mockRejectedValueOnce(new Error('403'));
		const { result } = renderHook(() => useDeleteFaceProfileComment(7, 'user-9'), { wrapper });

		await expect(result.current.mutateAsync({ commentId: 55, payload })).rejects.toThrow('403');
		expect(invalidate).not.toHaveBeenCalled();
	});
});
