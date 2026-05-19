import { getApiErrorMessage } from './apiErrorMessage';

/** Map React Query / fetch errors to a user-visible string. */
export function getQueryErrorMessage(error: unknown, fallback: string): string {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === 'string' && error.trim()) return error;
	return fallback;
}

/** When error is a failed `Response` from `authFetch`. */
export async function getQueryErrorMessageFromResponse(
	res: Response,
	fallback: string
): Promise<string> {
	return getApiErrorMessage(res, fallback);
}
