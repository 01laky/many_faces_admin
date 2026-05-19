import { useEffect, useRef } from 'react';
import type { SortingState } from '@tanstack/react-table';
import { toast } from 'react-toastify';
import {
	getListValidationErrorBody,
	isListSortValidationError,
	parseSortWhitelistError,
} from '@/utils/adminListQuery';

/**
 * §1.8 — On invalid sortBy/sortDir (400), toast and reset sorting so the table falls back to server default order.
 */
export function useAdminListSortValidationFeedback(
	error: unknown,
	isError: boolean,
	setSorting: React.Dispatch<React.SetStateAction<SortingState>>
): void {
	const lastMessageRef = useRef<string | null>(null);

	useEffect(() => {
		if (!isError || !isListSortValidationError(error)) {
			lastMessageRef.current = null;
			return;
		}
		const body = getListValidationErrorBody(error);
		const message = parseSortWhitelistError(body);
		if (lastMessageRef.current !== message) {
			toast.error(message);
			lastMessageRef.current = message;
		}
		setSorting([]);
	}, [error, isError, setSorting]);
}
