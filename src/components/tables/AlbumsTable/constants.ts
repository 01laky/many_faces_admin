import type { SortingState } from '@tanstack/react-table';

/** Initial sort for the albums list: newest first. Colocated per §2.15 (table metadata out of TSX). */
export const ALBUMS_TABLE_DEFAULT_SORT: SortingState = [{ id: 'createdAt', desc: true }];
