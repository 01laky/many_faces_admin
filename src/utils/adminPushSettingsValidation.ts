import type { AdminPushSettingsDto } from '@/api/models/AdminPushSettingsDto';
import type { UpdateAdminPushSettingsRequest } from '@/api/models/AdminPushSettingsDto';
import { isAbsoluteHttpUri } from '@/utils/httpUri';

const LOC_KEY_PATTERN = /^[a-zA-Z0-9_.-]+$/;
const MAX_FIREBASE_JSON_BYTES = 32 * 1024;

export type AdminPushSettingsFormDraft = {
	enabled: boolean;
	workerGrpcUrl: string;
	workerAuthToken: string;
	clearWorkerAuthToken: boolean;
	titleLocKey: string;
	bodyLocKey: string;
	androidChannelId: string;
	grpcDeadlineSeconds: string;
	firebaseServiceAccountJson: string;
	clearFirebaseServiceAccountJson: boolean;
};

export type AdminPushWorkerUrlError = 'invalidWorkerUrl';
export type AdminPushLocKeyError = 'titleLocKeyRequired' | 'bodyLocKeyRequired' | 'invalidLocKey';
export type AdminPushGrpcDeadlineError = 'grpcDeadlineInvalid';
export type AdminPushFirebaseJsonError = 'firebaseJsonRequired' | 'firebaseJsonInvalid';

/** APC-U3 — worker gRPC URL format when push is enabled. */
export function validateAdminPushWorkerGrpcUrl(
	url: string,
	enabled: boolean
): AdminPushWorkerUrlError | null {
	if (!enabled) return null;
	const trimmed = url.trim();
	if (!trimmed) return 'invalidWorkerUrl';
	return isAbsoluteHttpUri(trimmed) ? null : 'invalidWorkerUrl';
}

/** APC-U2 — default loc keys when push is enabled. */
export function validateAdminPushLocKeys(
	draft: Pick<AdminPushSettingsFormDraft, 'titleLocKey' | 'bodyLocKey'>,
	enabled: boolean
): AdminPushLocKeyError | null {
	if (!enabled) return null;
	if (!draft.titleLocKey.trim()) return 'titleLocKeyRequired';
	if (!draft.bodyLocKey.trim()) return 'bodyLocKeyRequired';
	if (!LOC_KEY_PATTERN.test(draft.titleLocKey.trim())) return 'invalidLocKey';
	if (!LOC_KEY_PATTERN.test(draft.bodyLocKey.trim())) return 'invalidLocKey';
	return null;
}

/** APC-U2 — gRPC deadline 1–120 when provided. */
export function validateAdminPushGrpcDeadline(
	value: string,
	enabled: boolean
): AdminPushGrpcDeadlineError | null {
	if (!enabled) return null;
	const trimmed = value.trim();
	if (!trimmed) return 'grpcDeadlineInvalid';
	const seconds = Number.parseInt(trimmed, 10);
	if (!Number.isFinite(seconds) || seconds < 1 || seconds > 120) return 'grpcDeadlineInvalid';
	return null;
}

/** Client-side Firebase service account JSON shape check. */
export function validateAdminPushFirebaseJsonContent(
	json: string
): AdminPushFirebaseJsonError | null {
	const trimmed = json.trim();
	if (!trimmed) return 'firebaseJsonInvalid';
	if (trimmed.length > MAX_FIREBASE_JSON_BYTES) return 'firebaseJsonInvalid';

	try {
		const parsed = JSON.parse(trimmed) as Record<string, unknown>;
		if (parsed.type !== 'service_account') return 'firebaseJsonInvalid';
		if (typeof parsed.project_id !== 'string' || !parsed.project_id.trim()) {
			return 'firebaseJsonInvalid';
		}
		if (
			typeof parsed.private_key !== 'string' ||
			!parsed.private_key.trim() ||
			!parsed.private_key.includes('BEGIN')
		) {
			return 'firebaseJsonInvalid';
		}
		if (typeof parsed.client_email !== 'string' || !parsed.client_email.trim()) {
			return 'firebaseJsonInvalid';
		}
		return null;
	} catch {
		return 'firebaseJsonInvalid';
	}
}

export function hasAdminPushFirebaseCredentialsAfterDraft(
	draft: AdminPushSettingsFormDraft,
	baselineHasCredentials: boolean
): boolean {
	if (draft.clearFirebaseServiceAccountJson) return false;
	if (draft.firebaseServiceAccountJson.trim()) {
		return validateAdminPushFirebaseJsonContent(draft.firebaseServiceAccountJson) === null;
	}
	return baselineHasCredentials;
}

/** APC-U2 — Firebase credentials required when push is enabled. */
export function validateAdminPushFirebaseJson(
	draft: AdminPushSettingsFormDraft,
	baselineHasCredentials: boolean,
	enabled: boolean
): AdminPushFirebaseJsonError | null {
	if (!enabled) return null;
	if (draft.firebaseServiceAccountJson.trim()) {
		return validateAdminPushFirebaseJsonContent(draft.firebaseServiceAccountJson);
	}
	if (draft.clearFirebaseServiceAccountJson || !baselineHasCredentials) {
		return 'firebaseJsonRequired';
	}
	return null;
}

/** Client-side gate before Save is enabled (APC-U2/U3). */
export function isAdminPushSettingsFormSubmittable(
	draft: AdminPushSettingsFormDraft,
	baselineHasCredentials: boolean
): boolean {
	if (validateAdminPushWorkerGrpcUrl(draft.workerGrpcUrl, draft.enabled)) return false;
	if (validateAdminPushLocKeys(draft, draft.enabled)) return false;
	if (validateAdminPushGrpcDeadline(draft.grpcDeadlineSeconds, draft.enabled)) return false;
	if (validateAdminPushFirebaseJson(draft, baselineHasCredentials, draft.enabled)) return false;
	return true;
}

export function adminPushSettingsDtoToFormDraft(
	dto: AdminPushSettingsDto
): AdminPushSettingsFormDraft {
	return {
		enabled: dto.enabled,
		workerGrpcUrl: dto.workerGrpcUrl ?? '',
		workerAuthToken: '',
		clearWorkerAuthToken: false,
		titleLocKey: dto.defaults.titleLocKey,
		bodyLocKey: dto.defaults.bodyLocKey,
		androidChannelId: dto.defaults.androidChannelId ?? '',
		grpcDeadlineSeconds: String(dto.grpcDeadlineSeconds),
		firebaseServiceAccountJson: '',
		clearFirebaseServiceAccountJson: false,
	};
}

export function isAdminPushSettingsFormDirty(
	draft: AdminPushSettingsFormDraft,
	baseline: AdminPushSettingsFormDraft
): boolean {
	return (
		draft.enabled !== baseline.enabled ||
		draft.workerGrpcUrl !== baseline.workerGrpcUrl ||
		draft.workerAuthToken.trim().length > 0 ||
		draft.clearWorkerAuthToken ||
		draft.titleLocKey !== baseline.titleLocKey ||
		draft.bodyLocKey !== baseline.bodyLocKey ||
		draft.androidChannelId !== baseline.androidChannelId ||
		draft.grpcDeadlineSeconds !== baseline.grpcDeadlineSeconds ||
		draft.firebaseServiceAccountJson.trim().length > 0 ||
		draft.clearFirebaseServiceAccountJson
	);
}

/** APC-U3 — confirm when disabling push on save. */
export function adminPushSaveNeedsDisableConfirm(
	baseline: AdminPushSettingsFormDraft,
	draft: AdminPushSettingsFormDraft
): boolean {
	return baseline.enabled && !draft.enabled;
}

/** APC-U4 — confirm when worker gRPC URL changes. */
export function adminPushSaveNeedsWorkerUrlConfirm(
	baseline: AdminPushSettingsFormDraft,
	draft: AdminPushSettingsFormDraft
): boolean {
	return baseline.workerGrpcUrl.trim() !== draft.workerGrpcUrl.trim();
}

/** Confirm when Firebase service account JSON is rotated or cleared. */
export function adminPushSaveNeedsFirebaseJsonConfirm(
	draft: AdminPushSettingsFormDraft,
	baselineHasCredentials: boolean
): boolean {
	if (!baselineHasCredentials) return draft.firebaseServiceAccountJson.trim().length > 0;
	return (
		draft.clearFirebaseServiceAccountJson || draft.firebaseServiceAccountJson.trim().length > 0
	);
}

export function buildUpdateAdminPushSettingsRequest(
	draft: AdminPushSettingsFormDraft
): UpdateAdminPushSettingsRequest {
	const deadline = Number.parseInt(draft.grpcDeadlineSeconds.trim(), 10);
	const request: UpdateAdminPushSettingsRequest = {
		enabled: draft.enabled,
		workerGrpcUrl: draft.workerGrpcUrl.trim() || null,
		defaults: {
			titleLocKey: draft.titleLocKey.trim(),
			bodyLocKey: draft.bodyLocKey.trim(),
			androidChannelId: draft.androidChannelId.trim() || null,
		},
		grpcDeadlineSeconds: Number.isFinite(deadline) ? deadline : 15,
	};

	if (draft.clearWorkerAuthToken) {
		request.workerAuthToken = '';
	} else if (draft.workerAuthToken.trim()) {
		request.workerAuthToken = draft.workerAuthToken;
	}

	if (draft.clearFirebaseServiceAccountJson) {
		request.firebase = { serviceAccountJson: '' };
	} else if (draft.firebaseServiceAccountJson.trim()) {
		request.firebase = { serviceAccountJson: draft.firebaseServiceAccountJson.trim() };
	}

	return request;
}
