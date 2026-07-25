import type { FaceVisibility } from '@/hooks/api/useFacesApi';

/** Validated output of the edit-face yup schema — what `onSubmit` receives. */
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

/**
 * Live field-values shape for `useForm`. It differs from the `…FormData` output type above because
 * `yupResolver` is typed `Resolver<Input, Context, InferType<schema>>`: the *input* keeps every key
 * present and widens `.optional()` fields to `T | undefined`, while the *output* turns them into
 * optional keys. `useForm` checks the resolver parameter against `TFieldValues` and the result
 * against `TTransformedValues`, so the two shapes cannot be collapsed into one interface.
 */
export interface EditFaceFormValues {
	index: string;
	title: string;
	description: string | undefined;
	gradientSettings: string | undefined;
	isPublic: boolean;
	visibility: FaceVisibility;
	allowRecensions: boolean;
	chatRoomsCreate: boolean;
	videoLoungesCreate: boolean;
}
