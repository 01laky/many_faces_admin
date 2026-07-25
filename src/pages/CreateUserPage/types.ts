/** Validated output of the create-user yup schema — what `onSubmit` receives. */
export interface CreateUserFormData {
	email: string;
	password: string;
	confirmPassword: string;
	firstName?: string;
	lastName?: string;
}

/**
 * Live field-values shape for `useForm`. It differs from the `…FormData` output type above because
 * `yupResolver` is typed `Resolver<Input, Context, InferType<schema>>`: the *input* keeps every key
 * present and widens `.optional()` fields to `T | undefined`, while the *output* turns them into
 * optional keys. `useForm` checks the resolver parameter against `TFieldValues` and the result
 * against `TTransformedValues`, so the two shapes cannot be collapsed into one interface.
 */
export interface CreateUserFormValues {
	email: string;
	password: string;
	confirmPassword: string;
	firstName: string | undefined;
	lastName: string | undefined;
}
