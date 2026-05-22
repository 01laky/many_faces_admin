import type { TFunction } from 'i18next';
import { ApiError } from '@/api/core/ApiError';

/** Backend Activate AI failures return 503 `{ error?, errorCode? }` (`OperatorAiEnableService` codes). */
export function resolveOperatorAiEnableErrorMessage(t: TFunction, err: unknown): string {
	if (err instanceof ApiError && err.status === 503) {
		const code =
			err.body &&
			typeof err.body === 'object' &&
			err.body !== null &&
			'errorCode' in err.body &&
			typeof (err.body as { errorCode?: unknown }).errorCode === 'string'
				? (err.body as { errorCode: string }).errorCode
				: '';
		if (code === 'worker_unreachable')
			return t('pages.settings.aiSystem.enableErrorWorkerUnreachable');
		if (code === 'model_loading_timeout')
			return t('pages.settings.aiSystem.enableErrorLoadingTimeout');
	}
	return t('pages.settings.aiSystem.enableError');
}
