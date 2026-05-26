import type { Dispatch, SetStateAction } from 'react';
import type { OperatorUserFaceRow, FaceRoleOption } from '@/hooks/api/useOperatorUsersApi';

export interface UserDetailAlbumsTableProps {
	creatorId: string;
	userFaceIds: number[];
}

export interface UserDetailBlogsTableProps {
	creatorId: string;
}

export interface UserDetailFacesTableProps {
	faces: OperatorUserFaceRow[];
	faceRoles: FaceRoleOption[];
	faceBanReasonById: Record<number, string>;
	setFaceBanReasonById: Dispatch<SetStateAction<Record<number, string>>>;
	onRoleChange: (faceId: number, userRoleId: number) => void;
	onFaceBan: (faceId: number) => void;
	onFaceUnban: (faceId: number) => void;
	roleChangePending: boolean;
	faceBanPending: boolean;
	faceUnbanPending: boolean;
}

export interface UserDetailReelsTableProps {
	creatorId: string;
	userFaceIds: number[];
}

export interface UserDetailStoriesTableProps {
	creatorId: string;
	userFaceIds: number[];
}
