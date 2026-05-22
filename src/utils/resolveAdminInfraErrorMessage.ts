import type { TFunction } from 'i18next';
import { ApiError } from '@/api/core/ApiError';

function readErrorBodyText(body: unknown): string {
	if (typeof body === 'string') return body;
	if (body && typeof body === 'object') {
		const record = body as Record<string, unknown>;
		if (typeof record.title === 'string') return record.title;
		if (typeof record.detail === 'string') return record.detail;
		if (typeof record.message === 'string') return record.message;
	}
	return '';
}

/** Maps admin infrastructure smoke API errors to localized Settings copy. */
export function resolveAdminInfraErrorMessage(t: TFunction, err: unknown): string {
	if (!(err instanceof ApiError)) {
		return t('pages.settings.infra.errors.generic');
	}

	if (err.status === 403) {
		return t('pages.settings.infra.errors.forbidden');
	}

	if (err.status === 401) {
		return t('common.error');
	}

	if (err.status === 400) {
		const text = readErrorBodyText(err.body);
		const lower = text.toLowerCase();
		if (lower.includes('mail worker') || lower.includes('mail:enabled')) {
			return t('pages.settings.infra.errors.mailDisabled');
		}
		if (lower.includes('no email')) {
			return t('pages.settings.infra.errors.noEmail');
		}
		if (lower.includes('push worker') || lower.includes('push:enabled')) {
			return t('pages.settings.infra.errors.pushDisabled');
		}
		if (lower.includes('device') || lower.includes('push-token')) {
			return t('pages.settings.infra.errors.noPushDevices');
		}
	}

	return t('pages.settings.infra.errors.generic');
}
