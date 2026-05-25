import { request as __request } from './core/request';
import { OpenAPI } from './core/OpenAPI';
import type {
	AdminMailSettingsDto,
	AdminMailTestSmtpResultDto,
	UpdateAdminMailSettingsRequest,
} from './models/AdminMailSettingsDto';

export async function fetchAdminMailSettings(token: string): Promise<AdminMailSettingsDto> {
	OpenAPI.TOKEN = token;
	const raw = await __request<Record<string, unknown>>(OpenAPI, {
		method: 'GET',
		url: '/api/admin/mail/settings',
	});
	return mapAdminMailSettingsDto(raw);
}

export async function updateAdminMailSettings(
	token: string,
	body: UpdateAdminMailSettingsRequest
): Promise<AdminMailSettingsDto> {
	OpenAPI.TOKEN = token;
	const raw = await __request<Record<string, unknown>>(OpenAPI, {
		method: 'PUT',
		url: '/api/admin/mail/settings',
		body,
	});
	return mapAdminMailSettingsDto(raw);
}

export async function testAdminMailSmtp(token: string): Promise<AdminMailTestSmtpResultDto> {
	OpenAPI.TOKEN = token;
	return __request(OpenAPI, {
		method: 'POST',
		url: '/api/admin/mail/settings/test-smtp',
	});
}

/** Normalizes GET/PUT payload — secrets are flags only (AMC-U1). */
export function mapAdminMailSettingsDto(raw: Record<string, unknown>): AdminMailSettingsDto {
	const smtp = (raw.smtp ?? {}) as Record<string, unknown>;
	const from = (raw.from ?? {}) as Record<string, unknown>;
	const registrationLinks = (raw.registrationLinks ?? {}) as Record<string, unknown>;

	const dto: AdminMailSettingsDto = {
		enabled: Boolean(raw.enabled),
		defaultLocale: String(raw.defaultLocale ?? 'en'),
		workerGrpcUrl: (raw.workerGrpcUrl as string | null | undefined) ?? null,
		hasWorkerAuthToken: Boolean(raw.hasWorkerAuthToken),
		smtp: {
			host: String(smtp.host ?? ''),
			port: Number(smtp.port ?? 587),
			startTls: Boolean(smtp.startTls),
			user: (smtp.user as string | null | undefined) ?? null,
			hasPassword: Boolean(smtp.hasPassword),
		},
		from: {
			email: String(from.email ?? ''),
			displayName: (from.displayName as string | null | undefined) ?? null,
		},
		registrationLinks: {
			portalPublicBaseUrl: String(registrationLinks.portalPublicBaseUrl ?? ''),
			completeRegistrationPathTemplate: String(
				registrationLinks.completeRegistrationPathTemplate ?? ''
			),
			mobileDeepLinkBase: String(registrationLinks.mobileDeepLinkBase ?? ''),
			preferMobileDeepLinkWhenPlatformMobile: Boolean(
				registrationLinks.preferMobileDeepLinkWhenPlatformMobile
			),
		},
		effectiveStatus: String(raw.effectiveStatus ?? 'incomplete'),
		updatedAtUtc: String(raw.updatedAtUtc ?? ''),
		updatedByUserId: (raw.updatedByUserId as string | null | undefined) ?? null,
	};

	return dto;
}
