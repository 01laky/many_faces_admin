import { describe, it, expect } from 'vitest';
import {
	canSubmitFaceBan,
	canSubmitGlobalBan,
	formatOperatorUserDisplayName,
	getFaceStatusI18nKey,
	getUserDetailBadgeI18nKeys,
} from '../operatorUserDetailUi';

describe('operatorUserDetailUi', () => {
	it('blocks ban submit until reason is valid', () => {
		expect(canSubmitGlobalBan('short')).toBe(false);
		expect(canSubmitGlobalBan('valid reason here')).toBe(true);
		expect(canSubmitFaceBan(undefined)).toBe(false);
	});

	it('maps badge i18n keys from detail badges', () => {
		const keys = getUserDetailBadgeI18nKeys({
			isGloballyBanned: true,
			activeFaceBanCount: 2,
			emailConfirmed: false,
			accessTokenVersion: 1,
		});
		expect(keys).toContain('pages.userDetail.badgeGlobalBan');
		expect(keys).toContain('pages.userDetail.badgeFaceBans');
		expect(keys).toContain('pages.userDetail.badgeEmailUnconfirmed');
	});

	it('formatOperatorUserDisplayName prefers full name then email', () => {
		expect(
			formatOperatorUserDisplayName({
				id: 'u1',
				firstName: 'Ada',
				lastName: 'Lovelace',
				email: 'ada@test.com',
			})
		).toBe('Ada Lovelace');
		expect(
			formatOperatorUserDisplayName({
				id: 'u2',
				email: 'bob@test.com',
			})
		).toBe('bob@test.com');
	});

	it('maps face status labels', () => {
		expect(getFaceStatusI18nKey({ isFaceBanned: true, isActiveParticipant: false } as never)).toBe(
			'pages.userDetail.faceBanned'
		);
		expect(getFaceStatusI18nKey({ isFaceBanned: false, isActiveParticipant: true } as never)).toBe(
			'pages.userDetail.faceActive'
		);
	});
});
