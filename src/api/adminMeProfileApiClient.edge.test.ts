import { describe, expect, it } from 'vitest';
import type { AdminMeProfile } from '@/api/adminMeProfileApiClient';
import { mapAdminMeProfileDto, buildAdminMeFaceRolePatchBody } from '@/api/adminMeProfileApiClient';

describe('SAP-U1 adminMeProfile DTO mapping', () => {
	it('maps GET profile payload', () => {
		const dto = mapAdminMeProfileDto({
			id: 'u1',
			email: 'admin@admin.com',
			globalRole: { userRoleId: 1, name: 'SUPER_ADMIN' },
			emailConfirmed: true,
			faces: [
				{
					faceId: 1,
					faceIndex: 'admin',
					faceTitle: 'Admin',
					userRoleId: 2,
					roleName: 'FACE_ADMIN',
					isActiveParticipant: true,
				},
			],
		});
		expect(dto.globalRole.name).toBe('SUPER_ADMIN');
		expect(dto.faces).toHaveLength(1);
		expect(dto.emailConfirmed).toBe(true);
	});
});

describe('SAP-U2 face role PATCH payload', () => {
	it('builds userRoleId body', () => {
		expect(buildAdminMeFaceRolePatchBody(5)).toEqual({ userRoleId: 5 });
	});
});

describe('SAP-U9 profile DTO includes avatar URL', () => {
	it('maps globalAvatarUrl for chrome refresh', () => {
		const dto: AdminMeProfile = mapAdminMeProfileDto({
			id: 'u1',
			globalRole: { userRoleId: 1, name: 'SUPER_ADMIN' },
			emailConfirmed: true,
			globalAvatarUrl: 'https://cdn.example/a.png',
			faces: [],
		});
		expect(dto.globalAvatarUrl).toBe('https://cdn.example/a.png');
	});
});
