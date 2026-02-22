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
}

// Fetch users from API
const fetchUsers = async (params: UseUsersParams): Promise<UseUsersResponse> => {
	logger.info('Fetching users from API', params);

	try {
		const response = await __request(OpenAPI, {
			method: 'GET',
			url: '/api/users',
		});

		let users: User[] = Array.isArray(response) ? response : [];

		// Client-side filtering if search is provided
		if (params.search) {
			const searchLower = params.search.toLowerCase();
			users = users.filter(
				(user) =>
					user.email?.toLowerCase().includes(searchLower) ||
					user.firstName?.toLowerCase().includes(searchLower) ||
					user.lastName?.toLowerCase().includes(searchLower)
			);
		}

		// Client-side pagination
		const page = params.page || 1;
		const pageSize = params.pageSize || 10;
		const start = (page - 1) * pageSize;
		const end = start + pageSize;
		const paginatedUsers = users.slice(start, end);

		return {
			users: paginatedUsers,
			total: users.length,
			page,
			pageSize,
		};
	} catch (error) {
		logger.error('Error fetching users', error);
		throw error;
	}
};

// Fetch single user by ID from API
const fetchUser = async (id: string): Promise<User> => {
	logger.info('Fetching user from API', { id });

	try {
		const response = await __request(OpenAPI, {
			method: 'GET',
			url: `/api/users/${id}`,
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
		staleTime: 5 * 60 * 1000, // 5 minutes
		keepPreviousData: true,
	});
}

export function useUser(id: string) {
	return useQuery({
		queryKey: ['user', id],
		queryFn: () => fetchUser(id),
		enabled: !!id, // Only fetch if ID is provided
		staleTime: 5 * 60 * 1000, // 5 minutes
	});
}

// Create user mutation
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
			url: '/api/users',
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

// Update user mutation
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
			url: `/api/users/${id}`,
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
