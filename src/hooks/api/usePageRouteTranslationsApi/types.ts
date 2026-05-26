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
