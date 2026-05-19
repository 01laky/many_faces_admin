const MIN_LEN = 10;
const MAX_LEN = 2000;

export interface ReasonUserMessageFields {
	reason: string;
	userMessage: string;
}

/** Validates operator reason + creator-facing message for delete/reject dialogs. */
export function validateReasonAndUserMessage(fields: ReasonUserMessageFields): {
	valid: boolean;
	reasonError?: string;
	userMessageError?: string;
} {
	const reason = fields.reason.trim();
	const userMessage = fields.userMessage.trim();
	let reasonError: string | undefined;
	let userMessageError: string | undefined;

	if (!reason) reasonError = 'required';
	else if (reason.length < MIN_LEN) reasonError = 'min';
	else if (reason.length > MAX_LEN) reasonError = 'max';

	if (!userMessage) userMessageError = 'required';
	else if (userMessage.length < MIN_LEN) userMessageError = 'min';
	else if (userMessage.length > MAX_LEN) userMessageError = 'max';

	return {
		valid: !reasonError && !userMessageError,
		reasonError,
		userMessageError,
	};
}

/** Sync userMessage from reason until the operator edits userMessage manually. */
export function shouldSyncUserMessageFromReason(
	reason: string,
	userMessage: string,
	lastSyncedReason: string
): boolean {
	return userMessage.trim() === lastSyncedReason.trim() || userMessage.trim() === '';
}

export function nextSyncedUserMessage(reason: string): string {
	return reason;
}

/** Validates operator reason only (e.g. approve override when AI recommended reject). */
export function validateReasonOnly(reason: string): { valid: boolean; reasonError?: string } {
	const trimmed = reason.trim();
	let reasonError: string | undefined;
	if (!trimmed) reasonError = 'required';
	else if (trimmed.length < MIN_LEN) reasonError = 'min';
	else if (trimmed.length > MAX_LEN) reasonError = 'max';
	return { valid: !reasonError, reasonError };
}
