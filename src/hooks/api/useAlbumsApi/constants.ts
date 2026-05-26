import { OpenAPI } from '../../../api/core/OpenAPI';
import { request as __request } from '../../../api/core/request';
import { ADMIN_TABLE_PAGE_SIZE } from '../../../utils/adminTableUtils';
import { parsePaginatedEnvelope } from '../../../utils/adminListQuery';
import type { AlbumDetail, AlbumListItem, UseAlbumsListResponse, UseAlbumsParams } from './types';

export const fetchAlbums = async (params: UseAlbumsParams): Promise<UseAlbumsListResponse> => {
	const page = params.page || 1;
	const pageSize = params.pageSize || ADMIN_TABLE_PAGE_SIZE;
	const query: Record<string, string | number> = {
		faceId: params.faceId,
		page,
		pageSize,
	};
	if (params.search?.trim()) query.search = params.search.trim();
	if (params.sortBy) {
		query.sortBy = params.sortBy;
		query.sortDir = params.sortDir ?? 'asc';
	}
	if (params.approvalStatus) query.approvalStatus = params.approvalStatus;
	if (params.albumType) query.albumType = params.albumType;
	if (params.mediaType) query.mediaType = params.mediaType;

	const response = await __request(OpenAPI, {
		method: 'GET',
		url: '/api/albums',
		query,
	});
	return parsePaginatedEnvelope<AlbumListItem>(response, page, pageSize);
};

export const fetchAlbum = async (id: number, faceId: number): Promise<AlbumDetail> => {
	const response = await __request(OpenAPI, {
		method: 'GET',
		url: `/api/albums/${id}`,
		query: { faceId },
	});
	return response as AlbumDetail;
};

export const albumsKeys = {
	all: ['albums'] as const,
	list: (params: UseAlbumsParams) => [...albumsKeys.all, 'list', params] as const,
	detail: (id: number, faceId: number) => [...albumsKeys.all, 'detail', id, faceId] as const,
};
