import type { SortingState } from '@tanstack/react-table';

/** Initial sort for the profile reviews sub-table: newest first. Colocated per §2.15 (table metadata out of TSX). */
export const FACE_PROFILE_DETAIL_REVIEWS_TABLE_DEFAULT_SORT: SortingState = [
	{ id: 'createdAt', desc: true },
];

/** Initial sort for the profile comments sub-table: newest first. Colocated per §2.15 (table metadata out of TSX). */
export const FACE_PROFILE_DETAIL_COMMENTS_TABLE_DEFAULT_SORT: SortingState = [
	{ id: 'createdAt', desc: true },
];
