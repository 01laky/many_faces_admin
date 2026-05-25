export type AdminSearchRouteParams = {
	type: string;
	ids: Record<string, string>;
};

export type AdminSearchHitDto = {
	entityType: string;
	entityId: string;
	faceId?: string | null;
	title: string;
	subtitle?: string | null;
	highlights?: string[];
	routeParams?: AdminSearchRouteParams | null;
};

export type AdminSearchAutocompleteResponse = {
	query: string;
	offset: number;
	pageSize: number;
	hits: AdminSearchHitDto[];
	hasMore: boolean;
	nextOffset: number;
	searchAvailable: boolean;
	message?: string | null;
};
