export interface User {
	id: string;
	email: string;
	firstName?: string;
	lastName?: string;
	createdAt?: string;
}

export interface UseUsersParams {
	page?: number;
	pageSize?: number;
	search?: string;
	sortBy?: string;
	sortDir?: 'asc' | 'desc';
}

export interface UseUsersResponse {
	users: User[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
}

export interface UsersListApiResponse {
	items?: User[];
	totalCount?: number;
	page?: number;
	pageSize?: number;
	totalPages?: number;
}
