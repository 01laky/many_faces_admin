import { describe, expect, it } from 'vitest';
import type { AdminMeProfile } from '@/api/adminMeProfileApiClient';
import { mapAdminMeProfileDto, buildAdminMeFaceRolePatchBody } from '@/api/adminMeProfileApiClient';
import { applyOptimisticFaceRolePatch } from '@/utils/applyOptimisticFaceRolePatch';

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
					hasMembership: true,
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

describe('SAP-U12 mapAdminMeProfileDto nullable face fields', () => {
	it('preserves hasMembership and nullable userRoleId per face', () => {
		const dto = mapAdminMeProfileDto({
			id: 'u1',
			globalRole: { userRoleId: 1, name: 'SUPER_ADMIN' },
			emailConfirmed: true,
			faces: [
				{
					faceId: 2,
					faceIndex: 'demo',
					faceTitle: 'Demo',
					userRoleId: null,
					roleName: null,
					hasMembership: false,
					isActiveParticipant: false,
				},
				{
					faceId: 1,
					faceIndex: 'admin',
					faceTitle: 'Admin',
					userRoleId: 5,
					roleName: 'FACE_ADMIN',
					hasMembership: true,
					isActiveParticipant: true,
				},
			],
		});

		expect(dto.faces[0].userRoleId).toBeNull();
		expect(dto.faces[0].hasMembership).toBe(false);
		expect(dto.faces[1].userRoleId).toBe(5);
		expect(dto.faces[1].hasMembership).toBe(true);
	});
});

describe('SAP-U14 applyOptimisticFaceRolePatch', () => {
	it('sets membership fields on the patched face row', () => {
		const profile = mapAdminMeProfileDto({
			id: 'u1',
			globalRole: { userRoleId: 1, name: 'SUPER_ADMIN' },
			emailConfirmed: true,
			faces: [
				{
					faceId: 2,
					faceIndex: 'demo',
					faceTitle: 'Demo',
					userRoleId: null,
					roleName: null,
					hasMembership: false,
					isActiveParticipant: false,
				},
			],
		});

		const next = applyOptimisticFaceRolePatch(profile, 2, 3, 'FACE_USER');
		expect(next.faces[0].hasMembership).toBe(true);
		expect(next.faces[0].userRoleId).toBe(3);
		expect(next.faces[0].roleName).toBe('FACE_USER');
	});
});
