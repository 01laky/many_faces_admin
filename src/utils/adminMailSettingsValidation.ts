import type { AdminMailSettingsDto } from '@/api/models/AdminMailSettingsDto';
import type { UpdateAdminMailSettingsRequest } from '@/api/models/AdminMailSettingsDto';

/** Locales accepted by backend UpdateAdminMailSettingsValidator (AMC-U2). */
export const ADMIN_MAIL_SUPPORTED_LOCALES = ['en', 'sk', 'cs', 'de', 'fr', 'it'] as const;

export type AdminMailSettingsFormDraft = {
	enabled: boolean;
	defaultLocale: string;
	workerGrpcUrl: string;
	workerAuthToken: string;
	clearWorkerAuthToken: boolean;
	smtpHost: string;
	smtpPort: string;
	smtpStartTls: boolean;
	smtpUser: string;
	smtpPassword: string;
	clearSmtpPassword: boolean;
	fromEmail: string;
	fromDisplayName: string;
	portalPublicBaseUrl: string;
	completeRegistrationPathTemplate: string;
	mobileDeepLinkBase: string;
	preferMobileDeepLinkWhenPlatformMobile: boolean;
};

export type AdminMailLocaleError = 'unsupportedLocale';
export type AdminMailPathTemplateError = 'missingLocalePlaceholder';
export type AdminMailWorkerUrlError = 'invalidWorkerUrl';
export type AdminMailSmtpFieldError =
	| 'hostRequired'
	| 'portInvalid'
	| 'fromEmailRequired'
	| 'fromEmailInvalid';

/** AMC-U2 — default locale must be in supported list. */
export function validateAdminMailDefaultLocale(locale: string): AdminMailLocaleError | null {
	const trimmed = locale.trim();
	if (!trimmed) return 'unsupportedLocale';
	const supported = ADMIN_MAIL_SUPPORTED_LOCALES as readonly string[];
	return supported.some((l) => l.toLowerCase() === trimmed.toLowerCase())
		? null
		: 'unsupportedLocale';
}

/** AMC-U2 — registration path template must contain `{locale}`. */
export function validateAdminMailRegistrationPathTemplate(
	template: string
): AdminMailPathTemplateError | null {
	return template.includes('{locale}') ? null : 'missingLocalePlaceholder';
}

function isAbsoluteHttpUri(value: string): boolean {
	const trimmed = value.trim();
	if (!trimmed) return false;
	try {
		const uri = new URL(trimmed);
		return uri.protocol === 'http:' || uri.protocol === 'https:';
	} catch {
		return false;
	}
}

/** AMC-U3 — worker gRPC URL format when mail is enabled. */
export function validateAdminMailWorkerGrpcUrl(
	url: string,
	enabled: boolean
): AdminMailWorkerUrlError | null {
	if (!enabled) return null;
	const trimmed = url.trim();
	if (!trimmed) return 'invalidWorkerUrl';
	return isAbsoluteHttpUri(trimmed) ? null : 'invalidWorkerUrl';
}

/** AMC-U7 — SMTP host/port/from required when mail is enabled. */
export function validateAdminMailSmtpFields(
	draft: Pick<AdminMailSettingsFormDraft, 'smtpHost' | 'smtpPort' | 'fromEmail'>,
	enabled: boolean
): AdminMailSmtpFieldError | null {
	if (!enabled) return null;
	if (!draft.smtpHost.trim()) return 'hostRequired';
	const port = Number.parseInt(draft.smtpPort.trim(), 10);
	if (!Number.isFinite(port) || port < 1 || port > 65535) return 'portInvalid';
	if (!draft.fromEmail.trim()) return 'fromEmailRequired';
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.fromEmail.trim())) return 'fromEmailInvalid';
	return null;
}

/** Client-side gate before Save is enabled (AMC-U3 + AMC-U7). */
export function isAdminMailSettingsFormSubmittable(draft: AdminMailSettingsFormDraft): boolean {
	if (validateAdminMailDefaultLocale(draft.defaultLocale)) return false;
	if (validateAdminMailRegistrationPathTemplate(draft.completeRegistrationPathTemplate))
		return false;
	if (validateAdminMailWorkerGrpcUrl(draft.workerGrpcUrl, draft.enabled)) return false;
	if (validateAdminMailSmtpFields(draft, draft.enabled)) return false;
	return true;
}

export function adminMailSettingsDtoToFormDraft(
	dto: AdminMailSettingsDto
): AdminMailSettingsFormDraft {
	return {
		enabled: dto.enabled,
		defaultLocale: dto.defaultLocale,
		workerGrpcUrl: dto.workerGrpcUrl ?? '',
		workerAuthToken: '',
		clearWorkerAuthToken: false,
		smtpHost: dto.smtp.host,
		smtpPort: String(dto.smtp.port),
		smtpStartTls: dto.smtp.startTls,
		smtpUser: dto.smtp.user ?? '',
		smtpPassword: '',
		clearSmtpPassword: false,
		fromEmail: dto.from.email,
		fromDisplayName: dto.from.displayName ?? '',
		portalPublicBaseUrl: dto.registrationLinks.portalPublicBaseUrl,
		completeRegistrationPathTemplate: dto.registrationLinks.completeRegistrationPathTemplate,
		mobileDeepLinkBase: dto.registrationLinks.mobileDeepLinkBase,
		preferMobileDeepLinkWhenPlatformMobile:
			dto.registrationLinks.preferMobileDeepLinkWhenPlatformMobile,
	};
}

export function isAdminMailSettingsFormDirty(
	draft: AdminMailSettingsFormDraft,
	baseline: AdminMailSettingsFormDraft
): boolean {
	return (
		draft.enabled !== baseline.enabled ||
		draft.defaultLocale !== baseline.defaultLocale ||
		draft.workerGrpcUrl !== baseline.workerGrpcUrl ||
		draft.workerAuthToken.trim().length > 0 ||
		draft.clearWorkerAuthToken ||
		draft.smtpHost !== baseline.smtpHost ||
		draft.smtpPort !== baseline.smtpPort ||
		draft.smtpStartTls !== baseline.smtpStartTls ||
		draft.smtpUser !== baseline.smtpUser ||
		draft.smtpPassword.trim().length > 0 ||
		draft.clearSmtpPassword ||
		draft.fromEmail !== baseline.fromEmail ||
		draft.fromDisplayName !== baseline.fromDisplayName ||
		draft.portalPublicBaseUrl !== baseline.portalPublicBaseUrl ||
		draft.completeRegistrationPathTemplate !== baseline.completeRegistrationPathTemplate ||
		draft.mobileDeepLinkBase !== baseline.mobileDeepLinkBase ||
		draft.preferMobileDeepLinkWhenPlatformMobile !== baseline.preferMobileDeepLinkWhenPlatformMobile
	);
}

/** AMC-U4 — confirm when disabling mail on save. */
export function adminMailSaveNeedsDisableConfirm(
	baseline: AdminMailSettingsFormDraft,
	draft: AdminMailSettingsFormDraft
): boolean {
	return baseline.enabled && !draft.enabled;
}

/** Confirm when worker gRPC URL changes. */
export function adminMailSaveNeedsWorkerUrlConfirm(
	baseline: AdminMailSettingsFormDraft,
	draft: AdminMailSettingsFormDraft
): boolean {
	return baseline.workerGrpcUrl.trim() !== draft.workerGrpcUrl.trim();
}

/** AMC-U8 — confirm when SMTP host changes. */
export function adminMailSaveNeedsSmtpHostConfirm(
	baseline: AdminMailSettingsFormDraft,
	draft: AdminMailSettingsFormDraft
): boolean {
	return baseline.smtpHost.trim() !== draft.smtpHost.trim();
}

export function buildUpdateAdminMailSettingsRequest(
	draft: AdminMailSettingsFormDraft
): UpdateAdminMailSettingsRequest {
	const port = Number.parseInt(draft.smtpPort.trim(), 10);
	const request: UpdateAdminMailSettingsRequest = {
		enabled: draft.enabled,
		defaultLocale: draft.defaultLocale.trim(),
		workerGrpcUrl: draft.workerGrpcUrl.trim() || null,
		smtp: {
			host: draft.smtpHost.trim(),
			port: Number.isFinite(port) ? port : 587,
			startTls: draft.smtpStartTls,
			user: draft.smtpUser.trim() || null,
		},
		from: {
			email: draft.fromEmail.trim(),
			displayName: draft.fromDisplayName.trim() || null,
		},
		registrationLinks: {
			portalPublicBaseUrl: draft.portalPublicBaseUrl.trim(),
			completeRegistrationPathTemplate: draft.completeRegistrationPathTemplate.trim(),
			mobileDeepLinkBase: draft.mobileDeepLinkBase.trim(),
			preferMobileDeepLinkWhenPlatformMobile: draft.preferMobileDeepLinkWhenPlatformMobile,
		},
	};

	if (draft.clearWorkerAuthToken) {
		request.workerAuthToken = '';
	} else if (draft.workerAuthToken.trim()) {
		request.workerAuthToken = draft.workerAuthToken;
	}

	if (draft.clearSmtpPassword) {
		request.smtp!.password = '';
	} else if (draft.smtpPassword.trim()) {
		request.smtp!.password = draft.smtpPassword;
	}

	return request;
}
