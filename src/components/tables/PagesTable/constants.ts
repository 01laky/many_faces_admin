import type { SortingState } from '@tanstack/react-table';

/** Initial sort for the CMS pages list: page order (index) ascending. Colocated per §2.15 (table metadata out of TSX). */
export const PAGES_TABLE_DEFAULT_SORT: SortingState = [{ id: 'index', desc: false }];
