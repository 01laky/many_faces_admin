import { useQuery } from '@tanstack/react-query';
import { OpenAPI } from '../../api/core/OpenAPI';
import { request as __request } from '../../api/core/request';
import { logger } from '../../utils/logger';

export interface User {
	id: string;
	email: string;
	firstName?: string;
	lastName?: string;
	createdAt?: string;
}

interface UseUsersParams {
	page?: number;
	pageSize?: number;
	search?: string;
}

interface UseUsersResponse {
	users: User[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
}

interface UsersListApiResponse {
	items?: User[];
	totalCount?: number;
	page?: number;
	pageSize?: number;
	totalPages?: number;
}

/** @internal Exported for unit tests — maps backend paginated Users DTO to hook shape. */
export function parseUsersListResponse(
	response: unknown,
	fallbackPage: number,
	fallbackPageSize: number
): UseUsersResponse {
	if (Array.isArray(response)) {
		return {
			users: response as User[],
			total: response.length,
			page: fallbackPage,
			pageSize: fallbackPageSize,
			totalPages: Math.max(1, Math.ceil(response.length / fallbackPageSize)),
		};
	}

	const body = response as UsersListApiResponse;
	const items = Array.isArray(body?.items) ? body.items : [];
	const totalCount = typeof body?.totalCount === 'number' ? body.totalCount : items.length;
	const page = typeof body?.page === 'number' ? body.page : fallbackPage;
	const pageSize = typeof body?.pageSize === 'number' ? body.pageSize : fallbackPageSize;
	const totalPages =
		typeof body?.totalPages === 'number'
			? body.totalPages
			: Math.max(0, Math.ceil(totalCount / pageSize));

	return {
		users: items,
		total: totalCount,
		page,
		pageSize,
		totalPages,
	};
}

const fetchUsers = async (params: UseUsersParams): Promise<UseUsersResponse> => {
	const page = params.page || 1;
	const pageSize = params.pageSize || 10;

	logger.info('Fetching users from API', params);

	try {
		const response = await __request(OpenAPI, {
			method: 'GET',
			url: '/api/Users',
			query: {
				page,
				pageSize,
				...(params.search?.trim() ? { search: params.search.trim() } : {}),
			},
		});

		return parseUsersListResponse(response, page, pageSize);
	} catch (error) {
		logger.error('Error fetching users', error);
		throw error;
	}
};

const fetchUser = async (id: string): Promise<User> => {
	logger.info('Fetching user from API', { id });

	try {
		const response = await __request(OpenAPI, {
			method: 'GET',
			url: '/api/Users/{id}',
			path: { id },
		});

		return response as User;
	} catch (error) {
		logger.error('Error fetching user', error);
		throw error;
	}
};

export function useUsers(params: UseUsersParams = {}) {
	return useQuery({
		queryKey: ['users', params],
		queryFn: () => fetchUsers(params),
		staleTime: 5 * 60 * 1000,
		keepPreviousData: true,
	});
}

export function useUser(id: string) {
	return useQuery({
		queryKey: ['user', id],
		queryFn: () => fetchUser(id),
		enabled: !!id,
		staleTime: 5 * 60 * 1000,
	});
}

export interface CreateUserData {
	email: string;
	password: string;
	firstName?: string;
	lastName?: string;
}

const createUserRequest = async (data: CreateUserData): Promise<User> => {
	logger.info('Creating user via API', { email: data.email });

	try {
		const response = await __request(OpenAPI, {
			method: 'POST',
			url: '/api/Users',
			body: data,
		});

		return response as User;
	} catch (error) {
		logger.error('Error creating user', error);
		throw error;
	}
};

export function createUser(data: CreateUserData): Promise<User> {
	return createUserRequest(data);
}

export interface UpdateUserData {
	email?: string;
	password?: string;
	firstName?: string;
	lastName?: string;
}

const updateUserRequest = async (id: string, data: UpdateUserData): Promise<User> => {
	logger.info('Updating user via API', { id, email: data.email });

	try {
		const response = await __request(OpenAPI, {
			method: 'PUT',
			url: '/api/Users/{id}',
			path: { id },
			body: data,
		});

		return response as User;
	} catch (error) {
		logger.error('Error updating user', error);
		throw error;
	}
};

export function updateUser(id: string, data: UpdateUserData): Promise<User> {
	return updateUserRequest(id, data);
}
