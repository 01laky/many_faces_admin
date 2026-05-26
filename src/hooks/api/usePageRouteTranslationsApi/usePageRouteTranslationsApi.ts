import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { OpenAPI } from '../../../api/core/OpenAPI';
import { request as __request } from '../../../api/core/request';
import { logger } from '../../../utils/logger';
import type { PageRouteTranslation, PageRouteTranslationData } from './types';
import { fetchPageRouteTranslations } from './constants';

// Fetch route translations for a page

export function usePageRouteTranslations(pageId: number) {
	return useQuery({
		queryKey: ['pageRouteTranslations', pageId],
		queryFn: () => fetchPageRouteTranslations(pageId),
		enabled: !!pageId,
		staleTime: 5 * 60 * 1000,
	});
}

// Update route translations for a page
const updatePageRouteTranslationsRequest = async (
	pageId: number,
	data: PageRouteTranslationData[]
): Promise<PageRouteTranslation[]> => {
	logger.info('Updating page route translations via API', { pageId, count: data.length });

	try {
		const response = await __request(OpenAPI, {
			method: 'PUT',
			url: `/api/pages/${pageId}/translations`,
			body: data,
		});

		return Array.isArray(response) ? response : [];
	} catch (error) {
		logger.error('Error updating page route translations', error);
		throw error;
	}
};

export function updatePageRouteTranslations(
	pageId: number,
	data: PageRouteTranslationData[]
): Promise<PageRouteTranslation[]> {
	return updatePageRouteTranslationsRequest(pageId, data);
}

export function useUpdatePageRouteTranslations() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ pageId, data }: { pageId: number; data: PageRouteTranslationData[] }) =>
			updatePageRouteTranslations(pageId, data),
		onSuccess: (_result, { pageId }) => {
			void queryClient.invalidateQueries({ queryKey: ['pageRouteTranslations', pageId] });
		},
	});
}
