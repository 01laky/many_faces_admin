import { describe, expect, it } from 'vitest';
import type { ApiRequestOptions } from '@/api/core/ApiRequestOptions';
import type { ApiResult } from '@/api/core/ApiResult';
import { ApiError } from '@/api/core/ApiError';
import { resolveAdminInfraErrorMessage } from '../resolveAdminInfraErrorMessage';

const t = (key: string) => key;

function makeError(status: number, body: unknown) {
	const response = { url: '/x', ok: false, status, statusText: 'x', body } as ApiResult;
	return new ApiError({} as ApiRequestOptions, response, 'x');
}

describe('resolveAdminInfraErrorMessage', () => {
	it('maps 403 to forbidden copy', () => {
		expect(resolveAdminInfraErrorMessage(t, makeError(403, ''))).toBe(
			'pages.settings.infra.errors.forbidden'
		);
	});

	it('maps mail disabled plain text', () => {
		expect(
			resolveAdminInfraErrorMessage(
				t,
				makeError(
					400,
					'Mail worker is disabled or misconfigured (Mail:Enabled / Mail:WorkerGrpcUrl).'
				)
			)
		).toBe('pages.settings.infra.errors.mailDisabled');
	});

	it('maps no email plain text', () => {
		expect(resolveAdminInfraErrorMessage(t, makeError(400, 'Account has no email address.'))).toBe(
			'pages.settings.infra.errors.noEmail'
		);
	});

	it('maps push no devices plain text', () => {
		expect(
			resolveAdminInfraErrorMessage(
				t,
				makeError(
					400,
					'No push devices registered for this account. Call POST /api/me/push-token from the mobile app first.'
				)
			)
		).toBe('pages.settings.infra.errors.noPushDevices');
	});
});
