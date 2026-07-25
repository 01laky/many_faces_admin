import type { SortingState } from '@tanstack/react-table';

/** Initial sort for the face video lounges list: newest first. Colocated per §2.15 (table metadata out of TSX). */
export const FACE_VIDEO_LOUNGES_TABLE_DEFAULT_SORT: SortingState = [
	{ id: 'createdAt', desc: true },
];
