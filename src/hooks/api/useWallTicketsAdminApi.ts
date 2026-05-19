import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
export type {
	AdminWallTicketRow,
	AdminWallTicketDetail,
	AdminWallTicketCreateBody,
} from '@/api/services/wallTicketsAdminApi';
import {
	adminApproveWallTicket,
	adminCreateWallTicket,
	adminDeleteWallTicket,
	adminDeleteWallTicketComment,
	adminDenyWallTicket,
	adminGetWallTicket,
	adminListWallTickets,
	adminPostWallTicketComment,
	type AdminWallTicketCreateBody,
} from '@/api/services/wallTicketsAdminApi';

const WALL_TICKETS_STALE_MS = 45_000;

export const wallTicketsKeys = {
	all: ['wallTickets'] as const,
	list: (faceId: number, page: number, pageSize: number, status?: string) =>
		[...wallTicketsKeys.all, 'list', faceId, page, pageSize, status ?? ''] as const,
	detail: (faceId: number, ticketId: number) =>
		[...wallTicketsKeys.all, 'detail', faceId, ticketId] as const,
};

function invalidateWallTicketStats(queryClient: ReturnType<typeof useQueryClient>) {
	void queryClient.invalidateQueries({ queryKey: ['stats'] });
}

export function useAdminWallTicketsList(
	faceId: number,
	page: number,
	pageSize: number,
	status?: string
) {
	const { token } = useAuth();
	return useQuery({
		queryKey: wallTicketsKeys.list(faceId, page, pageSize, status),
		queryFn: () => adminListWallTickets(token!, faceId, page, pageSize, status),
		enabled: Boolean(token) && faceId > 0,
		staleTime: WALL_TICKETS_STALE_MS,
	});
}

export function useAdminWallTicketDetail(faceId: number, ticketId: number | null) {
	const { token } = useAuth();
	return useQuery({
		queryKey:
			ticketId != null && ticketId > 0
				? wallTicketsKeys.detail(faceId, ticketId)
				: [...wallTicketsKeys.all, 'detail', 'none'],
		queryFn: () => adminGetWallTicket(token!, faceId, ticketId!),
		enabled: Boolean(token) && faceId > 0 && ticketId != null && ticketId > 0,
		staleTime: WALL_TICKETS_STALE_MS,
	});
}

export function useAdminCreateWallTicket() {
	const { token } = useAuth();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ faceId, body }: { faceId: number; body: AdminWallTicketCreateBody }) =>
			adminCreateWallTicket(token!, faceId, body),
		onSuccess: (_data, { faceId }) => {
			void queryClient.invalidateQueries({ queryKey: wallTicketsKeys.all });
			void queryClient.invalidateQueries({ queryKey: wallTicketsKeys.list(faceId, 1, 20, '') });
			invalidateWallTicketStats(queryClient);
		},
	});
}

export function useAdminApproveWallTicket() {
	const { token } = useAuth();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ faceId, ticketId }: { faceId: number; ticketId: number }) =>
			adminApproveWallTicket(token!, faceId, ticketId),
		onSuccess: (_void, { faceId, ticketId }) => {
			void queryClient.invalidateQueries({ queryKey: wallTicketsKeys.all });
			void queryClient.invalidateQueries({ queryKey: wallTicketsKeys.detail(faceId, ticketId) });
			invalidateWallTicketStats(queryClient);
		},
	});
}

export function useAdminDenyWallTicket() {
	const { token } = useAuth();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ faceId, ticketId }: { faceId: number; ticketId: number }) =>
			adminDenyWallTicket(token!, faceId, ticketId),
		onSuccess: (_void, { faceId, ticketId }) => {
			void queryClient.invalidateQueries({ queryKey: wallTicketsKeys.all });
			void queryClient.invalidateQueries({ queryKey: wallTicketsKeys.detail(faceId, ticketId) });
			invalidateWallTicketStats(queryClient);
		},
	});
}

export function useAdminDeleteWallTicket() {
	const { token } = useAuth();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ faceId, ticketId }: { faceId: number; ticketId: number }) =>
			adminDeleteWallTicket(token!, faceId, ticketId),
		onSuccess: (_void, { faceId, ticketId }) => {
			queryClient.removeQueries({ queryKey: wallTicketsKeys.detail(faceId, ticketId) });
			void queryClient.invalidateQueries({ queryKey: wallTicketsKeys.all });
			invalidateWallTicketStats(queryClient);
		},
	});
}

export function useAdminPostWallTicketComment() {
	const { token } = useAuth();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			faceId,
			ticketId,
			content,
		}: {
			faceId: number;
			ticketId: number;
			content: string;
		}) => adminPostWallTicketComment(token!, faceId, ticketId, content),
		onSuccess: (_comment, { faceId, ticketId }) => {
			void queryClient.invalidateQueries({ queryKey: wallTicketsKeys.detail(faceId, ticketId) });
			void queryClient.invalidateQueries({ queryKey: wallTicketsKeys.all });
		},
	});
}

export function useAdminDeleteWallTicketComment() {
	const { token } = useAuth();
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			faceId,
			ticketId,
			commentId,
		}: {
			faceId: number;
			ticketId: number;
			commentId: number;
		}) => adminDeleteWallTicketComment(token!, faceId, ticketId, commentId),
		onSuccess: (_void, { faceId, ticketId }) => {
			void queryClient.invalidateQueries({ queryKey: wallTicketsKeys.detail(faceId, ticketId) });
		},
	});
}

/** True when list query failed with 403 / forbidden (for operator without access). */
export function isWallTicketsForbiddenError(error: unknown): boolean {
	const msg = error instanceof Error ? error.message : String(error);
	return /403|forbidden/i.test(msg);
}
