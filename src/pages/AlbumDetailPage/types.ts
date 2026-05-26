import type { AlbumDetail } from '@/hooks/api/useAlbumsApi';

export type DialogMode = 'deleteAlbum' | 'deleteMedia' | 'reject' | null;

export interface AlbumDetailHeaderProps {
	album: AlbumDetail;
	isSuperAdmin: boolean;
	onOpenChat: () => void;
	onOpenQueue: () => void;
}

export interface AlbumDetailDetailsProps {
	album: AlbumDetail;
}
