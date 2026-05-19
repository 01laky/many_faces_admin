import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { OpenAPI } from '../../api/core/OpenAPI';
import { request as __request } from '../../api/core/request';
import { logger } from '../../utils/logger';

export interface PageRouteTranslation {
	id: number;
	pageId: number;
	languageCode: string;
	translatedRoute: string;
	createdAt?: string;
	updatedAt?: string | null;
}

export interface PageRouteTranslationData {
	languageCode: string;
	translatedRoute: string;
}

// Fetch route translations for a page
const fetchPageRouteTranslations = async (pageId: number): Promise<PageRouteTranslation[]> => {
	logger.info('Fetching page route translations from API', { pageId });

	try {
		const response = await __request(OpenAPI, {
			method: 'GET',
			url: `/api/pages/${pageId}/translations`,
		});

		return Array.isArray(response) ? response : [];
	} catch (error) {
		logger.error(`Error fetching route translations for page ${pageId}`, error);
		throw error;
	}
};

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
