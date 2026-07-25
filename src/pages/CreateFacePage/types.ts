/** Validated output of the create-face yup schema — what `onSubmit` receives. */
export interface CreateFaceFormData {
	index: string;
	title: string;
	description?: string;
	isPublic: boolean;
}

/**
 * Live field-values shape for `useForm`. It differs from the `…FormData` output type above because
 * `yupResolver` is typed `Resolver<Input, Context, InferType<schema>>`: the *input* keeps every key
 * present and widens `.optional()` fields to `T | undefined`, while the *output* turns them into
 * optional keys. `useForm` checks the resolver parameter against `TFieldValues` and the result
 * against `TTransformedValues`, so the two shapes cannot be collapsed into one interface.
 */
export interface CreateFaceFormValues {
	index: string;
	title: string;
	description: string | undefined;
	isPublic: boolean;
}
