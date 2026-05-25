/** Fixed page size for admin global search autocomplete (matches backend max). */
export const ADMIN_SEARCH_PAGE_SIZE = 100;

/** Debounce delay after last keystroke before firing autocomplete. */
export const ADMIN_SEARCH_DEBOUNCE_MS = 300;

/** Minimum query length before calling the API. */
export const ADMIN_SEARCH_MIN_QUERY_LENGTH = 2;

/** Max dropdown height in pixels (see GlobalSearchAutocomplete.scss). */
export const ADMIN_SEARCH_DROPDOWN_MAX_HEIGHT_PX = 320;

/** IntersectionObserver root margin — load more when sentinel is within this distance of list bottom. */
export const ADMIN_SEARCH_LOAD_MORE_THRESHOLD_PX = 80;

/** Optional entity-type filter chips (matches backend SearchDocumentTypes.All). */
export const ADMIN_SEARCH_ENTITY_TYPES = [
	'user',
	'face',
	'page',
	'album',
	'blog',
	'reel',
	'story',
	'face_chat_room',
	'video_lounge',
	'face_profile',
	'wall_ticket',
] as const;

export type AdminSearchEntityType = (typeof ADMIN_SEARCH_ENTITY_TYPES)[number];
