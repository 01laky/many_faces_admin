import { request as __request } from './core/request';
import { OpenAPI } from './core/OpenAPI';
import type {
	AdminPushSettingsDto,
	AdminPushTestFcmResultDto,
	TestAdminPushFcmRequest,
	UpdateAdminPushSettingsRequest,
} from './models/AdminPushSettingsDto';

export async function fetchAdminPushSettings(token: string): Promise<AdminPushSettingsDto> {
	OpenAPI.TOKEN = token;
	const raw = await __request<Record<string, unknown>>(OpenAPI, {
		method: 'GET',
		url: '/api/admin/push/settings',
	});
	return mapAdminPushSettingsDto(raw);
}

export async function updateAdminPushSettings(
	token: string,
	body: UpdateAdminPushSettingsRequest
): Promise<AdminPushSettingsDto> {
	OpenAPI.TOKEN = token;
	const raw = await __request<Record<string, unknown>>(OpenAPI, {
		method: 'PUT',
		url: '/api/admin/push/settings',
		body,
	});
	return mapAdminPushSettingsDto(raw);
}

export async function testAdminPushFcm(
	token: string,
	body?: TestAdminPushFcmRequest
): Promise<AdminPushTestFcmResultDto> {
	OpenAPI.TOKEN = token;
	return __request(OpenAPI, {
		method: 'POST',
		url: '/api/admin/push/settings/test-fcm',
		body: body ?? {},
	});
}

/** Normalizes GET/PUT payload — secrets are flags only (APC-U1). */
export function mapAdminPushSettingsDto(raw: Record<string, unknown>): AdminPushSettingsDto {
	const firebase = (raw.firebase ?? {}) as Record<string, unknown>;
	const defaults = (raw.defaults ?? {}) as Record<string, unknown>;
	const transport = (raw.transport ?? {}) as Record<string, unknown>;

	const dto: AdminPushSettingsDto = {
		enabled: Boolean(raw.enabled),
		workerGrpcUrl: (raw.workerGrpcUrl as string | null | undefined) ?? null,
		hasWorkerAuthToken: Boolean(raw.hasWorkerAuthToken),
		firebase: {
			projectId: (firebase.projectId as string | null | undefined) ?? null,
			hasCredentials: Boolean(firebase.hasCredentials),
		},
		defaults: {
			titleLocKey: String(defaults.titleLocKey ?? ''),
			bodyLocKey: String(defaults.bodyLocKey ?? ''),
			androidChannelId: (defaults.androidChannelId as string | null | undefined) ?? null,
		},
		grpcDeadlineSeconds: Number(raw.grpcDeadlineSeconds ?? 15),
		transport: {
			tlsConfiguredViaEnv: Boolean(transport.tlsConfiguredViaEnv),
			mtlsConfiguredViaEnv: Boolean(transport.mtlsConfiguredViaEnv),
		},
		effectiveStatus: String(raw.effectiveStatus ?? 'incomplete'),
		updatedAtUtc: String(raw.updatedAtUtc ?? ''),
		updatedByUserId: (raw.updatedByUserId as string | null | undefined) ?? null,
	};

	return dto;
}
