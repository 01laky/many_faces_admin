import { request as __request } from './core/request';
import { OpenAPI } from './core/OpenAPI';

export interface AdminMeFaceRow {
	faceId: number;
	faceIndex: string;
	faceTitle: string;
	userRoleId: number | null;
	roleName: string | null;
	hasMembership: boolean;
	isActiveParticipant: boolean;
}

export interface AdminMeProfile {
	id: string;
	email?: string;
	firstName?: string;
	lastName?: string;
	createdAt?: string;
	globalRole: { userRoleId: number; name: string };
	emailConfirmed: boolean;
	globalAvatarUrl?: string | null;
	faces: AdminMeFaceRow[];
}

export interface UpdateAdminMeProfileBody {
	email?: string;
	firstName?: string | null;
	lastName?: string | null;
}

export interface UpdateAdminMePasswordBody {
	currentPassword: string;
	newPassword: string;
	confirmPassword: string;
}

export async function fetchAdminMeProfile(): Promise<AdminMeProfile> {
	const raw = await __request(OpenAPI, {
		method: 'GET',
		url: '/api/admin/me/profile',
	});
	return mapAdminMeProfileDto(raw as Record<string, unknown>);
}

export async function updateAdminMeProfile(
	body: UpdateAdminMeProfileBody
): Promise<AdminMeProfile> {
	const raw = await __request(OpenAPI, {
		method: 'PUT',
		url: '/api/admin/me/profile',
		body,
	});
	return mapAdminMeProfileDto(raw as Record<string, unknown>);
}

export async function updateAdminMePassword(body: UpdateAdminMePasswordBody): Promise<void> {
	await __request(OpenAPI, {
		method: 'PUT',
		url: '/api/admin/me/password',
		body,
	});
}

export async function patchAdminMeFaceRole(faceId: number, userRoleId: number): Promise<void> {
	await __request(OpenAPI, {
		method: 'PATCH',
		url: '/api/admin/me/faces/{faceId}/role',
		path: { faceId },
		body: { userRoleId },
	});
}

export async function resendAdminMeEmailConfirmation(): Promise<void> {
	await __request(OpenAPI, {
		method: 'POST',
		url: '/api/admin/me/resend-email-confirmation',
	});
}

export async function uploadAdminMeAvatar(file: File): Promise<{ avatarUrl: string }> {
	const formData = { file };
	return __request(OpenAPI, {
		method: 'POST',
		url: '/api/profile/me/avatar',
		formData,
		mediaType: 'multipart/form-data',
	});
}

function mapAdminMeFaceRow(raw: Record<string, unknown>): AdminMeFaceRow {
	const userRoleIdRaw = raw.userRoleId;
	return {
		faceId: Number(raw.faceId),
		faceIndex: String(raw.faceIndex ?? ''),
		faceTitle: String(raw.faceTitle ?? ''),
		userRoleId: userRoleIdRaw == null || userRoleIdRaw === undefined ? null : Number(userRoleIdRaw),
		roleName: raw.roleName == null ? null : String(raw.roleName),
		hasMembership: Boolean(raw.hasMembership),
		isActiveParticipant: Boolean(raw.isActiveParticipant),
	};
}

/** Normalizes raw API JSON into {@link AdminMeProfile} (SAP-U1). */
export function mapAdminMeProfileDto(raw: Record<string, unknown>): AdminMeProfile {
	const facesRaw = raw.faces;
	const faces = Array.isArray(facesRaw)
		? facesRaw.map((row) => mapAdminMeFaceRow(row as Record<string, unknown>))
		: [];

	return {
		id: String(raw.id),
		email: raw.email as string | undefined,
		firstName: raw.firstName as string | undefined,
		lastName: raw.lastName as string | undefined,
		createdAt: raw.createdAt as string | undefined,
		globalRole: raw.globalRole as AdminMeProfile['globalRole'],
		emailConfirmed: Boolean(raw.emailConfirmed),
		globalAvatarUrl: raw.globalAvatarUrl as string | null | undefined,
		faces,
	};
}

/** PATCH body for self face role change (SAP-U2). */
export function buildAdminMeFaceRolePatchBody(userRoleId: number): { userRoleId: number } {
	return { userRoleId };
}
