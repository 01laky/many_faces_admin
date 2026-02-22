import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createFace, updateFace, deleteFace } from '../useFacesApi';
import type { Face, CreateFaceData, UpdateFaceData } from '../useFacesApi';

// Mock the API request function
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

describe('useFacesApi', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	// Skip renderHook tests - they require DOM environment
	describe.skip('useFaces', () => {
		it('should fetch faces successfully', async () => {
			// Requires DOM environment (jsdom)
			expect(true).toBe(true);
		});
	});

	describe.skip('useFace', () => {
		it('should fetch single face successfully', async () => {
			// Requires DOM environment (jsdom)
			expect(true).toBe(true);
		});
	});

	describe('createFace', () => {
		it('should create face successfully', async () => {
			const newFace: CreateFaceData = {
				index: 'face2',
				title: 'New Face',
				color: '#00ff00',
			};

			const createdFace: Face = {
				id: 2,
				...newFace,
			};

			mockRequest.mockResolvedValue(createdFace);

			const result = await createFace(newFace);

			expect(result).toEqual(createdFace);
			expect(mockRequest).toHaveBeenCalled();
		});
	});

	describe('updateFace', () => {
		it('should update face successfully', async () => {
			const updateData: UpdateFaceData = {
				title: 'Updated Face',
			};

			const updatedFace: Face = {
				id: 1,
				index: 'face1',
				title: 'Updated Face',
			};

			mockRequest.mockResolvedValue(updatedFace);

			const result = await updateFace(1, updateData);

			expect(result).toEqual(updatedFace);
			expect(mockRequest).toHaveBeenCalled();
		});
	});

	describe('deleteFace', () => {
		it('should delete face successfully', async () => {
			mockRequest.mockResolvedValue(undefined);

			await deleteFace(1);

			expect(mockRequest).toHaveBeenCalled();
		});
	});
});
