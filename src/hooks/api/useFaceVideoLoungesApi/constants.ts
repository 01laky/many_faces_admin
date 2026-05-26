import { OpenAPI } from '../../../api/core/OpenAPI';
import { request as __request } from '../../../api/core/request';
import { ADMIN_TABLE_PAGE_SIZE } from '../../../utils/adminTableUtils';
import { parsePaginatedEnvelope } from '../../../utils/adminListQuery';
import type {
	FaceVideoLoungeDetail,
	FaceVideoLoungeListItem,
	UseFaceVideoLoungesParams,
} from './types';

export const fetchLounges = async (params: UseFaceVideoLoungesParams) => {
	const page = params.page || 1;
	const pageSize = params.pageSize || ADMIN_TABLE_PAGE_SIZE;
	const query: Record<string, string | number | boolean> = { page, pageSize };
	if (params.search?.trim()) query.search = params.search.trim();
	if (params.sortBy) {
		query.sortBy = params.sortBy;
		query.sortDir = params.sortDir ?? 'asc';
	}
	if (params.isPublic != null) query.isPublic = params.isPublic;
	const response = await __request(OpenAPI, {
		method: 'GET',
		url: `/api/faces/${params.faceId}/video-lounges`,
		query,
	});
	return parsePaginatedEnvelope<FaceVideoLoungeListItem>(response, page, pageSize);
};

export const fetchLounge = async (
	faceId: number,
	loungeId: number
): Promise<FaceVideoLoungeDetail> => {
	const response = await __request(OpenAPI, {
		method: 'GET',
		url: `/api/faces/${faceId}/video-lounges/${loungeId}`,
	});
	return response as FaceVideoLoungeDetail;
};
