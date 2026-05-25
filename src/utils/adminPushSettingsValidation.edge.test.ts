import { describe, expect, it } from 'vitest';
import { mapAdminPushSettingsDto } from '@/api/adminPushSettingsApiClient';
import {
	adminPushSaveNeedsDisableConfirm,
	adminPushSaveNeedsFirebaseJsonConfirm,
	adminPushSaveNeedsWorkerUrlConfirm,
	adminPushSettingsDtoToFormDraft,
	isAdminPushSettingsFormSubmittable,
	validateAdminPushFirebaseJsonContent,
	validateAdminPushGrpcDeadline,
	validateAdminPushLocKeys,
	validateAdminPushWorkerGrpcUrl,
} from '@/utils/adminPushSettingsValidation';

describe('APC-U1 mapAdminPushSettingsDto drops secrets', () => {
	it('maps flags only and omits plaintext secrets', () => {
		const dto = mapAdminPushSettingsDto({
			enabled: true,
			workerGrpcUrl: 'http://push:50051',
			hasWorkerAuthToken: true,
			workerAuthToken: 'must-not-leak',
			firebase: {
				projectId: 'demo-project',
				hasCredentials: true,
				serviceAccountJson: 'must-not-leak',
			},
			defaults: {
				titleLocKey: 'push.title',
				bodyLocKey: 'push.body',
				androidChannelId: 'default',
			},
			grpcDeadlineSeconds: 15,
			transport: { tlsConfiguredViaEnv: false, mtlsConfiguredViaEnv: false },
			effectiveStatus: 'configured',
			updatedAtUtc: '2026-05-25T12:00:00Z',
		});

		expect(dto.hasWorkerAuthToken).toBe(true);
		expect(dto.firebase.hasCredentials).toBe(true);
		expect(Object.keys(dto)).not.toContain('workerAuthToken');
		expect(Object.keys(dto.firebase)).not.toContain('serviceAccountJson');
	});
});

describe('APC-U2 loc keys, deadline, and firebase validation', () => {
	it('accepts valid loc keys and rejects invalid', () => {
		expect(
			validateAdminPushLocKeys({ titleLocKey: 'push.title', bodyLocKey: 'push.body' }, true)
		).toBeNull();
		expect(validateAdminPushLocKeys({ titleLocKey: '', bodyLocKey: 'push.body' }, true)).toBe(
			'titleLocKeyRequired'
		);
		expect(
			validateAdminPushLocKeys({ titleLocKey: 'bad key', bodyLocKey: 'push.body' }, true)
		).toBe('invalidLocKey');
	});

	it('requires grpc deadline between 1 and 120 when enabled', () => {
		expect(validateAdminPushGrpcDeadline('15', true)).toBeNull();
		expect(validateAdminPushGrpcDeadline('0', true)).toBe('grpcDeadlineInvalid');
		expect(validateAdminPushGrpcDeadline('999', true)).toBe('grpcDeadlineInvalid');
	});

	it('validates firebase service account JSON shape', () => {
		expect(
			validateAdminPushFirebaseJsonContent(
				JSON.stringify({
					type: 'service_account',
					project_id: 'demo',
					private_key: '-----BEGIN PRIVATE KEY-----\nabc\n-----END PRIVATE KEY-----\n',
					client_email: 'firebase-adminsdk@demo.iam.gserviceaccount.com',
				})
			)
		).toBeNull();
		expect(validateAdminPushFirebaseJsonContent('not-json')).toBe('firebaseJsonInvalid');
	});
});

describe('APC-U3 worker URL blocks save when invalid', () => {
	it('rejects invalid worker URL when push enabled', () => {
		const draft = adminPushSettingsDtoToFormDraft(
			mapAdminPushSettingsDto({
				enabled: true,
				workerGrpcUrl: 'not-a-url',
				hasWorkerAuthToken: false,
				firebase: { projectId: 'demo', hasCredentials: true },
				defaults: { titleLocKey: 'push.title', bodyLocKey: 'push.body', androidChannelId: null },
				grpcDeadlineSeconds: 15,
				transport: { tlsConfiguredViaEnv: false, mtlsConfiguredViaEnv: false },
				effectiveStatus: 'incomplete',
				updatedAtUtc: '2026-05-25T12:00:00Z',
			})
		);

		expect(validateAdminPushWorkerGrpcUrl(draft.workerGrpcUrl, draft.enabled)).toBe(
			'invalidWorkerUrl'
		);
		expect(isAdminPushSettingsFormSubmittable(draft, true)).toBe(false);
	});
});

describe('APC-U3/U4 save confirm helpers', () => {
	const baseline = adminPushSettingsDtoToFormDraft(
		mapAdminPushSettingsDto({
			enabled: true,
			workerGrpcUrl: 'http://push:50051',
			hasWorkerAuthToken: false,
			firebase: { projectId: 'demo', hasCredentials: true },
			defaults: { titleLocKey: 'push.title', bodyLocKey: 'push.body', androidChannelId: null },
			grpcDeadlineSeconds: 15,
			transport: { tlsConfiguredViaEnv: false, mtlsConfiguredViaEnv: false },
			effectiveStatus: 'configured',
			updatedAtUtc: '2026-05-25T12:00:00Z',
		})
	);

	it('detects disable, worker URL, and Firebase JSON changes', () => {
		expect(adminPushSaveNeedsDisableConfirm(baseline, { ...baseline, enabled: false })).toBe(true);
		expect(
			adminPushSaveNeedsWorkerUrlConfirm(baseline, {
				...baseline,
				workerGrpcUrl: 'http://push-new:50051',
			})
		).toBe(true);
		expect(
			adminPushSaveNeedsFirebaseJsonConfirm(
				{ ...baseline, firebaseServiceAccountJson: '{"type":"service_account"}' },
				true
			)
		).toBe(true);
	});
});
