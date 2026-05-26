export interface FaceProfileDetailCommentsTableProps {
	faceId: number;
	userId: string;
	isSuperAdmin: boolean;
	onDeleteComment: (commentId: number) => void;
}

export interface FaceProfileDetailReviewsTableProps {
	faceId: number;
	userId: string;
	faceAllowsRecensions: boolean;
	isSuperAdmin: boolean;
	onDeleteReview: (reviewId: number) => void;
}
