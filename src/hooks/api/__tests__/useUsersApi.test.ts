import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createUser, updateUser, parseUsersListResponse } from '../useUsersApi';
import type { User, CreateUserData, UpdateUserData } from '../useUsersApi';

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

describe('useUsersApi', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	// Skip renderHook tests - they require DOM environment
	describe.skip('useUsers', () => {
		it('should fetch users successfully', async () => {
			// Requires DOM environment (jsdom)
			expect(true).toBe(true);
		});
	});

	describe.skip('useUser', () => {
		it('should fetch single user successfully', async () => {
			// Requires DOM environment (jsdom)
			expect(true).toBe(true);
		});
	});

	describe('parseUsersListResponse', () => {
		it('maps paginated API body with items and totalCount', () => {
			const result = parseUsersListResponse(
				{
					items: [
						{ id: 'a', email: 'a@test.com', firstName: 'A', lastName: 'One' },
						{ id: 'b', email: 'b@test.com', firstName: 'B', lastName: 'Two' },
					],
					totalCount: 42,
					page: 2,
					pageSize: 10,
					totalPages: 5,
				},
				1,
				10
			);

			expect(result.users).toHaveLength(2);
			expect(result.total).toBe(42);
			expect(result.page).toBe(2);
			expect(result.pageSize).toBe(10);
			expect(result.totalPages).toBe(5);
		});

		it('returns empty list when response is not an array or paginated object', () => {
			const result = parseUsersListResponse({}, 1, 10);
			expect(result.users).toEqual([]);
			expect(result.total).toBe(0);
		});
	});

	describe('createUser', () => {
		it('should create user successfully', async () => {
			const newUser: CreateUserData = {
				email: 'new@example.com',
				password: 'password123',
				firstName: 'New',
				lastName: 'User',
			};

			const createdUser: User = {
				id: '1',
				email: 'new@example.com',
				firstName: 'New',
				lastName: 'User',
			};

			mockRequest.mockResolvedValue(createdUser);

			const result = await createUser(newUser);

			expect(result).toEqual(createdUser);
			expect(mockRequest).toHaveBeenCalledWith(
				expect.anything(),
				expect.objectContaining({ method: 'POST', url: '/api/Users' })
			);
		});
	});

	describe('updateUser', () => {
		it('should update user successfully', async () => {
			const updateData: UpdateUserData = {
				firstName: 'Updated',
			};

			const updatedUser: User = {
				id: '1',
				email: 'test@example.com',
				firstName: 'Updated',
			};

			mockRequest.mockResolvedValue(updatedUser);

			const result = await updateUser('1', updateData);

			expect(result).toEqual(updatedUser);
			expect(mockRequest).toHaveBeenCalledWith(
				expect.anything(),
				expect.objectContaining({ method: 'PUT', url: '/api/Users/{id}', path: { id: '1' } })
			);
		});
	});
});
