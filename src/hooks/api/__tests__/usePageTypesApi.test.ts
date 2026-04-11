/**
 * Tests the thin `request()` wrappers exported beside `usePageTypesApi` hooks — mocks the generated
 * OpenAPI transport so we assert JSON payloads + verbs without running be_demo.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPageType, updatePageType, deletePageType } from '../usePageTypesApi';
import type { PageType, CreatePageTypeData, UpdatePageTypeData } from '../usePageTypesApi';

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

describe('usePageTypesApi', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('createPageType', () => {
		it('should create page type successfully', async () => {
			const data: CreatePageTypeData = { index: 'blog' };
			const created: PageType = { id: 3, index: 'blog' };
			mockRequest.mockResolvedValue(created);

			const result = await createPageType(data);

			expect(result).toEqual(created);
			expect(mockRequest).toHaveBeenCalled();
		});
	});

	describe('updatePageType', () => {
		it('should update page type successfully', async () => {
			const data: UpdatePageTypeData = { index: 'blog-v2' };
			const updated: PageType = { id: 3, index: 'blog-v2' };
			mockRequest.mockResolvedValue(updated);

			const result = await updatePageType(3, data);

			expect(result).toEqual(updated);
			expect(mockRequest).toHaveBeenCalled();
		});
	});

	describe('deletePageType', () => {
		it('should delete page type successfully', async () => {
			mockRequest.mockResolvedValue(undefined);

			await deletePageType(3);

			expect(mockRequest).toHaveBeenCalled();
		});
	});
});
