import { describe, expect, it } from 'vitest';
import type { ApiRequestOptions } from '@/api/core/ApiRequestOptions';
import type { ApiResult } from '@/api/core/ApiResult';
import { ApiError } from '@/api/core/ApiError';
import { resolveOperatorAiEnableErrorMessage } from '../resolveOperatorAiEnableErrorMessage';

const t = (key: string) => key;

function make503(body: Record<string, unknown>) {
	const response = { url: '/x', ok: false, status: 503, statusText: 'x', body } as ApiResult;
	return new ApiError({} as ApiRequestOptions, response, 'x');
}

describe('resolveOperatorAiEnableErrorMessage', () => {
	it('maps worker_unreachable to dedicated copy', () => {
		const msg = resolveOperatorAiEnableErrorMessage(
			t,
			make503({ errorCode: 'worker_unreachable' })
		);
		expect(msg).toBe('pages.settings.aiSystem.enableErrorWorkerUnreachable');
	});

	it('maps model_loading_timeout to loading copy', () => {
		const msg = resolveOperatorAiEnableErrorMessage(
			t,
			make503({ errorCode: 'model_loading_timeout' })
		);
		expect(msg).toBe('pages.settings.aiSystem.enableErrorLoadingTimeout');
	});

	it('falls back to generic enable error', () => {
		expect(resolveOperatorAiEnableErrorMessage(t, make503({ errorCode: 'unknown' }))).toBe(
			'pages.settings.aiSystem.enableError'
		);
		expect(resolveOperatorAiEnableErrorMessage(t, new Error('oops'))).toBe(
			'pages.settings.aiSystem.enableError'
		);
	});
});
