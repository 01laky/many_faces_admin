export interface EditFaceFormData {
	index: string;
	title: string;
	description?: string;
	gradientSettings?: string;
	isPublic: boolean;
	visibility: FaceVisibility;
	allowRecensions: boolean;
	chatRoomsCreate: boolean;
	videoLoungesCreate: boolean;
}
