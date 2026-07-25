import type { SortingState } from '@tanstack/react-table';

/** Initial sort for the room members sub-table: most recently joined first. Colocated per §2.15 (table metadata out of TSX). */
export const FACE_CHAT_ROOM_DETAIL_MEMBERS_TABLE_DEFAULT_SORT: SortingState = [
	{ id: 'joinedAt', desc: true },
];

/** Initial sort for the room messages sub-table: most recently sent first. Colocated per §2.15 (table metadata out of TSX). */
export const FACE_CHAT_ROOM_DETAIL_MESSAGES_TABLE_DEFAULT_SORT: SortingState = [
	{ id: 'sentAt', desc: true },
];
