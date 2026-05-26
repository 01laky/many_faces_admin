export interface OperatorUserFaceRow {
	faceId: number;
	faceIndex: string;
	faceTitle: string;
	userRoleId: number;
	roleName: string;
	isActiveParticipant: boolean;
	isFaceBanned: boolean;
}

export interface OperatorUserDetail {
	id: string;
	email?: string;
	firstName?: string;
	lastName?: string;
	createdAt?: string;
	globalRole: { userRoleId: number; name: string };
	badges: {
		isGloballyBanned: boolean;
		activeFaceBanCount: number;
		emailConfirmed: boolean;
		accessTokenVersion: number;
	};
	faces: OperatorUserFaceRow[];
}

export interface FaceRoleOption {
	id: number;
	name: string;
}
