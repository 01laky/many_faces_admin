import { getApiErrorMessage } from '../../utils/apiErrorMessage';
import { absoluteScopedUrl } from '../faceApiRouting';

const REQ_FAILED = 'Request failed';

async function authFetch(path: string, token: string, init?: RequestInit) {
	const res = await fetch(absoluteScopedUrl(path), {
		...init,
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json',
			Authorization: `Bearer ${token}`,
			...(init?.headers as Record<string, string>),
		},
	});
	return res;
}

export interface AdminWallTicketRow {
	id: number;
	title: string;
	descriptionPreview: string;
	status: string;
	creatorId: string;
	creatorName: string;
	likesCount: number;
	commentsCount: number;
	createdAt: string;
}

export interface AdminWallTicketListResponse {
	items: AdminWallTicketRow[];
	page: number;
	pageSize: number;
	totalCount: number;
	totalPages: number;
}

export interface AdminWallTicketComment {
	id: number;
	content: string;
	userId: string;
	authorName: string;
	createdAt: string;
}

export interface AdminWallTicketDetail {
	id: number;
	title: string;
	description: string;
	status: string;
	creatorId: string;
	creatorName: string;
	likesCount: number;
	commentsCount: number;
	createdAt: string;
	updatedAt: string | null;
	comments: AdminWallTicketComment[];
}

export interface AdminWallTicketCreateBody {
	title: string;
	description: string;
}

export interface AdminWallTicketCreateResult {
	id: number;
	title: string;
	status: string;
	createdAt: string;
}

export interface AdminWallTicketListParams {
	page?: number;
	pageSize?: number;
	status?: string;
	search?: string;
	sortBy?: string;
	sortDir?: 'asc' | 'desc';
}

export async function adminListWallTickets(
	token: string,
	faceId: number,
	params: AdminWallTicketListParams = {}
): Promise<AdminWallTicketListResponse> {
	const page = params.page ?? 1;
	const pageSize = params.pageSize ?? 10;
	const q = new URLSearchParams();
	q.set('page', String(page));
	q.set('pageSize', String(pageSize));
	if (params.status) q.set('status', params.status);
	if (params.search?.trim()) q.set('search', params.search.trim());
	if (params.sortBy) {
		q.set('sortBy', params.sortBy);
		q.set('sortDir', params.sortDir ?? 'asc');
	}
	const res = await authFetch(`/api/admin/faces/${faceId}/wall-tickets?${q.toString()}`, token);
	if (!res.ok) throw new Error(await getApiErrorMessage(res, REQ_FAILED));
	return res.json() as Promise<AdminWallTicketListResponse>;
}

export async function adminGetWallTicket(
	token: string,
	faceId: number,
	ticketId: number
): Promise<AdminWallTicketDetail> {
	const res = await authFetch(`/api/admin/faces/${faceId}/wall-tickets/${ticketId}`, token);
	if (!res.ok) throw new Error(await getApiErrorMessage(res, REQ_FAILED));
	return res.json() as Promise<AdminWallTicketDetail>;
}

export async function adminApproveWallTicket(
	token: string,
	faceId: number,
	ticketId: number
): Promise<void> {
	const res = await authFetch(
		`/api/admin/faces/${faceId}/wall-tickets/${ticketId}/approve`,
		token,
		{
			method: 'POST',
		}
	);
	if (!res.ok) throw new Error(await getApiErrorMessage(res, REQ_FAILED));
}

export async function adminDenyWallTicket(
	token: string,
	faceId: number,
	ticketId: number
): Promise<void> {
	const res = await authFetch(`/api/admin/faces/${faceId}/wall-tickets/${ticketId}/deny`, token, {
		method: 'POST',
	});
	if (!res.ok) throw new Error(await getApiErrorMessage(res, REQ_FAILED));
}

export async function adminDeleteWallTicket(
	token: string,
	faceId: number,
	ticketId: number
): Promise<void> {
	const res = await authFetch(`/api/admin/faces/${faceId}/wall-tickets/${ticketId}`, token, {
		method: 'DELETE',
	});
	if (!res.ok) throw new Error(await getApiErrorMessage(res, REQ_FAILED));
}

export async function adminCreateWallTicket(
	token: string,
	faceId: number,
	body: AdminWallTicketCreateBody
): Promise<AdminWallTicketCreateResult> {
	const res = await authFetch(`/api/admin/faces/${faceId}/wall-tickets`, token, {
		method: 'POST',
		body: JSON.stringify(body),
	});
	if (!res.ok) throw new Error(await getApiErrorMessage(res, REQ_FAILED));
	return res.json() as Promise<AdminWallTicketCreateResult>;
}

export async function adminPostWallTicketComment(
	token: string,
	faceId: number,
	ticketId: number,
	content: string
): Promise<AdminWallTicketComment> {
	const res = await authFetch(
		`/api/admin/faces/${faceId}/wall-tickets/${ticketId}/comments`,
		token,
		{
			method: 'POST',
			body: JSON.stringify({ content }),
		}
	);
	if (!res.ok) throw new Error(await getApiErrorMessage(res, REQ_FAILED));
	return res.json() as Promise<AdminWallTicketComment>;
}

export async function adminDeleteWallTicketComment(
	token: string,
	faceId: number,
	ticketId: number,
	commentId: number
): Promise<void> {
	const res = await authFetch(
		`/api/admin/faces/${faceId}/wall-tickets/${ticketId}/comments/${commentId}`,
		token,
		{ method: 'DELETE' }
	);
	if (!res.ok) throw new Error(await getApiErrorMessage(res, REQ_FAILED));
}
