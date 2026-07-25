import type { SortingState } from '@tanstack/react-table';

/** Initial sort for the stories list: newest first. Colocated per §2.15 (table metadata out of TSX). */
export const STORIES_TABLE_DEFAULT_SORT: SortingState = [{ id: 'createdAt', desc: true }];
