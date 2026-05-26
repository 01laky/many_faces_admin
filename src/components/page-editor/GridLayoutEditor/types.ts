export type GridComponentType =
	| 'album'
	| 'albumGrid'
	| 'albumCarousel'
	| 'ad'
	| 'adGrid'
	| 'adCarousel'
	| 'blog'
	| 'blogGrid'
	| 'blogCarousel'
	| 'chatRoom'
	| 'chatRoomGrid'
	| 'chatRoomCarousel'
	| 'videoLounge'
	| 'videoLoungeGrid'
	| 'videoLoungeCarousel'
	| 'userProfile'
	| 'userProfileGrid'
	| 'userProfileCarousel'
	| 'reel'
	| 'reelGrid'
	| 'reelCarousel'
	| 'story'
	| 'storyGrid'
	| 'storyCarousel';

export interface GridItem {
	i: string;
	x: number;
	y: number;
	w: number;
	h: number;
	minW?: number;
	minH?: number;
	label?: string;
	componentType?: GridComponentType;
	title?: string | null;
	icon?: string | null;
	boundChatRoomId?: number;
	boundVideoLoungeId?: number;
	boundAlbumId?: number;
	boundBlogId?: number;
	boundAdId?: number;
	boundUserProfileId?: string;
	boundReelId?: number;
	boundStoryId?: number;
}

export interface GridSchema {
	items: GridItem[];
	breakpoints: Record<string, number>;
	cols: Record<string, number>;
	rowHeight: number;
}

export interface GridLayoutEditorProps {
	value: GridSchema | null;
	onChange: (schema: GridSchema) => void;
}
