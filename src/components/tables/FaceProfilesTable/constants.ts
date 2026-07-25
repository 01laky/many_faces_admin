import type { SortingState } from '@tanstack/react-table';

/** Initial sort for the face profiles list: display name A→Z. Colocated per §2.15 (table metadata out of TSX). */
export const FACE_PROFILES_TABLE_DEFAULT_SORT: SortingState = [{ id: 'displayName', desc: false }];
