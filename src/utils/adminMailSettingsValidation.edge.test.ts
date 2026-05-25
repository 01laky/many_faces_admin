import { describe, expect, it } from 'vitest';
import { mapAdminMailSettingsDto } from '@/api/adminMailSettingsApiClient';
import {
	adminMailSaveNeedsDisableConfirm,
	adminMailSaveNeedsSmtpHostConfirm,
	adminMailSaveNeedsWorkerUrlConfirm,
	adminMailSettingsDtoToFormDraft,
	isAdminMailSettingsFormSubmittable,
	validateAdminMailDefaultLocale,
	validateAdminMailRegistrationPathTemplate,
	validateAdminMailSmtpFields,
	validateAdminMailWorkerGrpcUrl,
} from '@/utils/adminMailSettingsValidation';

describe('AMC-U1 mapAdminMailSettingsDto drops secrets', () => {
	it('maps flags only and omits plaintext secrets', () => {
		const dto = mapAdminMailSettingsDto({
			enabled: true,
			defaultLocale: 'en',
			workerGrpcUrl: 'http://mailer:50051',
			hasWorkerAuthToken: true,
			workerAuthToken: 'must-not-leak',
			smtp: {
				host: 'mailpit',
				port: 1025,
				startTls: false,
				user: 'u',
				hasPassword: true,
				password: 'must-not-leak',
			},
			from: { email: 'noreply@example.com', displayName: 'Demo' },
			registrationLinks: {
				portalPublicBaseUrl: 'https://portal.example',
				completeRegistrationPathTemplate: '/{locale}/register',
				mobileDeepLinkBase: 'manyfaces://',
				preferMobileDeepLinkWhenPlatformMobile: false,
			},
			effectiveStatus: 'configured',
			updatedAtUtc: '2026-05-25T12:00:00Z',
		});

		expect(dto.hasWorkerAuthToken).toBe(true);
		expect(dto.smtp.hasPassword).toBe(true);
		expect(Object.keys(dto)).not.toContain('workerAuthToken');
		expect(Object.keys(dto.smtp)).not.toContain('password');
	});
});

describe('AMC-U2 locale and path template validation', () => {
	it('accepts supported locales and rejects unknown', () => {
		expect(validateAdminMailDefaultLocale('en')).toBeNull();
		expect(validateAdminMailDefaultLocale('SK')).toBeNull();
		expect(validateAdminMailDefaultLocale('xx')).toBe('unsupportedLocale');
	});

	it('requires {locale} in registration path template', () => {
		expect(validateAdminMailRegistrationPathTemplate('/en/register')).toBe(
			'missingLocalePlaceholder'
		);
		expect(validateAdminMailRegistrationPathTemplate('/{locale}/register')).toBeNull();
	});
});

describe('AMC-U3 worker URL blocks save when invalid', () => {
	it('rejects invalid worker URL when mail enabled', () => {
		const draft = adminMailSettingsDtoToFormDraft(
			mapAdminMailSettingsDto({
				enabled: true,
				defaultLocale: 'en',
				workerGrpcUrl: 'not-a-url',
				hasWorkerAuthToken: false,
				smtp: { host: 'mailpit', port: 1025, startTls: false, hasPassword: false },
				from: { email: 'noreply@example.com' },
				registrationLinks: {
					portalPublicBaseUrl: 'https://portal.example',
					completeRegistrationPathTemplate: '/{locale}/register',
					mobileDeepLinkBase: '',
					preferMobileDeepLinkWhenPlatformMobile: false,
				},
				effectiveStatus: 'incomplete',
				updatedAtUtc: '2026-05-25T12:00:00Z',
			})
		);

		expect(validateAdminMailWorkerGrpcUrl(draft.workerGrpcUrl, draft.enabled)).toBe(
			'invalidWorkerUrl'
		);
		expect(isAdminMailSettingsFormSubmittable(draft)).toBe(false);
	});
});

describe('AMC-U7 SMTP validation when enabled', () => {
	it('requires host, port, and from email', () => {
		expect(
			validateAdminMailSmtpFields({ smtpHost: '', smtpPort: '1025', fromEmail: 'a@b.c' }, true)
		).toBe('hostRequired');
		expect(
			validateAdminMailSmtpFields({ smtpHost: 'mailpit', smtpPort: '0', fromEmail: 'a@b.c' }, true)
		).toBe('portInvalid');
		expect(
			validateAdminMailSmtpFields({ smtpHost: 'mailpit', smtpPort: '1025', fromEmail: '' }, true)
		).toBe('fromEmailRequired');
		expect(
			validateAdminMailSmtpFields({ smtpHost: 'mailpit', smtpPort: '1025', fromEmail: 'bad' }, true)
		).toBe('fromEmailInvalid');
	});
});

describe('AMC-U4/U8 save confirm helpers', () => {
	const baseline = adminMailSettingsDtoToFormDraft(
		mapAdminMailSettingsDto({
			enabled: true,
			defaultLocale: 'en',
			workerGrpcUrl: 'http://mailer:50051',
			hasWorkerAuthToken: false,
			smtp: { host: 'mailpit', port: 1025, startTls: false, hasPassword: false },
			from: { email: 'noreply@example.com' },
			registrationLinks: {
				portalPublicBaseUrl: 'https://portal.example',
				completeRegistrationPathTemplate: '/{locale}/register',
				mobileDeepLinkBase: '',
				preferMobileDeepLinkWhenPlatformMobile: false,
			},
			effectiveStatus: 'configured',
			updatedAtUtc: '2026-05-25T12:00:00Z',
		})
	);

	it('detects disable, worker URL, and SMTP host changes', () => {
		expect(adminMailSaveNeedsDisableConfirm(baseline, { ...baseline, enabled: false })).toBe(true);
		expect(
			adminMailSaveNeedsWorkerUrlConfirm(baseline, {
				...baseline,
				workerGrpcUrl: 'http://mailer-new:50051',
			})
		).toBe(true);
		expect(
			adminMailSaveNeedsSmtpHostConfirm(baseline, { ...baseline, smtpHost: 'smtp.example' })
		).toBe(true);
	});
});
