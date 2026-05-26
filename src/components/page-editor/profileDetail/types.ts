export type ProfileDetailSectionType =
	| 'profileHero'
	| 'profileMeta'
	| 'profileActions'
	| 'profileComments'
	| 'profileReviews'
	| 'profileBackNav'
	| 'userAlbums'
	| 'userBlogs'
	| 'userReels'
	| 'userStories'
	| 'spacer';

export interface ProfileDetailGridItem {
	i: string;
	x: number;
	y: number;
	w: number;
	h: number;
	minW?: number;
	minH?: number;
	sectionType?: ProfileDetailSectionType;
	label?: string;
	props?: Record<string, unknown>;
}

export interface ProfileDetailGridSchema {
	schemaVersion?: number;
	items: ProfileDetailGridItem[];
	breakpoints: Record<string, number>;
	cols: Record<string, number>;
	rowHeight: number;
}

export interface ProfileDetailGridLayoutEditorProps {
	value: ProfileDetailGridSchema | null;
	onChange: (schema: ProfileDetailGridSchema) => void;
}

export interface ProfileDetailSectionPickerModalProps {
	open: boolean;
	currentType?: ProfileDetailSectionType;
	onSelect: (type: ProfileDetailSectionType) => void;
	onClear: () => void;
	onClose: () => void;
}

export const PROFILE_DETAIL_SECTION_TYPES: ProfileDetailSectionType[] = [
	'profileBackNav',
	'profileHero',
	'profileMeta',
	'profileActions',
	'profileComments',
	'profileReviews',
	'userAlbums',
	'userBlogs',
	'userReels',
	'userStories',
	'spacer',
];
