export interface User {
	id: string;
	email: string;
	firstName?: string;
	lastName?: string;
	createdAt?: string;
}

// Declared as a type alias, not an interface: only aliases get TypeScript's implicit index
// signature, which is what lets the params bag be passed to `logger.info(msg, properties)`
// (`Record<string, unknown>`).
export type UseUsersParams = {
	page?: number;
	pageSize?: number;
	search?: string;
	sortBy?: string;
	sortDir?: 'asc' | 'desc';
};

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
