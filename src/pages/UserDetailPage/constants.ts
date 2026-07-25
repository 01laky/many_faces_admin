import type { SortingState } from '@tanstack/react-table';

/** Initial sort for the user blogs sub-table: newest first. Colocated per §2.15 (table metadata out of TSX). */
export const USER_DETAIL_BLOGS_TABLE_DEFAULT_SORT: SortingState = [{ id: 'createdAt', desc: true }];

/** Initial sort for the user stories sub-table: newest first. Colocated per §2.15 (table metadata out of TSX). */
export const USER_DETAIL_STORIES_TABLE_DEFAULT_SORT: SortingState = [
	{ id: 'createdAt', desc: true },
];

/** Initial sort for the user albums sub-table: newest first. Colocated per §2.15 (table metadata out of TSX). */
export const USER_DETAIL_ALBUMS_TABLE_DEFAULT_SORT: SortingState = [
	{ id: 'createdAt', desc: true },
];

/** Initial sort for the user reels sub-table: newest first. Colocated per §2.15 (table metadata out of TSX). */
export const USER_DETAIL_REELS_TABLE_DEFAULT_SORT: SortingState = [{ id: 'createdAt', desc: true }];
