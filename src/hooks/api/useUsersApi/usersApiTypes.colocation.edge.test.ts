import { describe, expect, it } from 'vitest';
import { parseUsersListResponse } from './useUsersApi';
import type { User, UsersListApiResponse } from './types';

const sampleUser: User = {
	id: 'u-1',
	email: 'admin@demo.com',
	firstName: 'Ada',
	lastName: 'Min',
};

describe('useUsersApi types + parseUsersListResponse (colocation)', () => {
	it('maps paginated envelope from UsersListApiResponse', () => {
		const body: UsersListApiResponse = {
			items: [sampleUser],
			totalCount: 42,
			page: 2,
			pageSize: 10,
			totalPages: 5,
		};

		const result = parseUsersListResponse(body, 1, 10);
		expect(result).toEqual({
			users: [sampleUser],
			total: 42,
			page: 2,
			pageSize: 10,
			totalPages: 5,
		});
	});

	it('falls back when optional envelope fields are missing', () => {
		const body: UsersListApiResponse = { items: [sampleUser] };
		const result = parseUsersListResponse(body, 3, 25);

		expect(result.users).toEqual([sampleUser]);
		expect(result.total).toBe(1);
		expect(result.page).toBe(3);
		expect(result.pageSize).toBe(25);
		expect(result.totalPages).toBe(1);
	});

	it('accepts raw array responses for legacy endpoints', () => {
		const result = parseUsersListResponse([sampleUser], 1, 10);
		expect(result.users).toEqual([sampleUser]);
		expect(result.total).toBe(1);
		expect(result.totalPages).toBe(1);
	});

	it('returns empty users when items is not an array', () => {
		const body = { items: null, totalCount: 0 } as unknown as UsersListApiResponse;
		const result = parseUsersListResponse(body, 1, 10);
		expect(result.users).toEqual([]);
		expect(result.total).toBe(0);
		expect(result.totalPages).toBe(0);
	});

	it('computes totalPages from totalCount when backend omits totalPages', () => {
		const body: UsersListApiResponse = {
			items: [sampleUser, { ...sampleUser, id: 'u-2', email: 'b@demo.com' }],
			totalCount: 11,
			pageSize: 5,
		};
		const result = parseUsersListResponse(body, 1, 5);
		expect(result.totalPages).toBe(3);
	});
});
