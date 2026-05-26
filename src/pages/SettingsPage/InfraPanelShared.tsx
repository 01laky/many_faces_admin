import { useTranslation } from 'react-i18next';
import {
	resolveInfraConfiguredBadge,
	resolveInfraStatusModifier,
} from '@/utils/adminInfraStatusStrip';
import {
	resolveMailEffectiveStatusBadge,
	resolveMailEffectiveStatusModifier,
} from '@/utils/adminMailEffectiveStatus';
import {
	resolvePushEffectiveStatusBadge,
	resolvePushEffectiveStatusModifier,
} from '@/utils/adminPushEffectiveStatus';

import type { InfraDevQuickLinksProps, InfraStatusStripProps } from './types';

/** Read-only configured / effective-status / last-test strip shared by mail and push panels. */
export function InfraStatusStrip({
	configured,
	effectiveStatus,
	effectiveStatusNamespace = 'mail',
	deviceCount,
	lastTest,
	updatedAtUtc,
}: InfraStatusStripProps) {
	const { t } = useTranslation('common');
	const usesEffectiveStatus = effectiveStatus != null;
	const badge = usesEffectiveStatus
		? effectiveStatusNamespace === 'push'
			? resolvePushEffectiveStatusBadge(effectiveStatus, configured)
			: resolveMailEffectiveStatusBadge(effectiveStatus, configured)
		: resolveInfraConfiguredBadge(configured);
	const modifier = usesEffectiveStatus
		? effectiveStatusNamespace === 'push'
			? resolvePushEffectiveStatusModifier(effectiveStatus, { lastTest })
			: resolveMailEffectiveStatusModifier(effectiveStatus, { lastTest })
		: resolveInfraStatusModifier(configured, { deviceCount, lastTest });
	const badgeKeyPrefix = usesEffectiveStatus
		? effectiveStatusNamespace === 'push'
			? 'pages.settings.infra.push.config.status'
			: 'pages.settings.infra.mail.config.status'
		: 'pages.settings.infra.status';
	const updatedAtKey =
		effectiveStatusNamespace === 'push'
			? 'pages.settings.infra.push.config.status.updatedAt'
			: 'pages.settings.infra.mail.config.status.updatedAt';

	return (
		<div className={`settings-page__infra-status settings-page__infra-status--${modifier}`}>
			<span className="settings-page__infra-badge">{t(`${badgeKeyPrefix}.${badge}`)}</span>
			{deviceCount != null &&
				configured &&
				(!usesEffectiveStatus || effectiveStatusNamespace === 'push') && (
					<span className="settings-page__infra-meta">
						{t('pages.settings.infra.push.deviceCount', { count: deviceCount })}
					</span>
				)}
			{updatedAtUtc && usesEffectiveStatus && (
				<span className="settings-page__infra-meta settings-page__infra-meta--muted">
					{t(updatedAtKey, {
						value: new Date(updatedAtUtc).toLocaleString(),
					})}
				</span>
			)}
			{lastTest?.kind === 'none' || !lastTest ? (
				<span className="settings-page__infra-meta settings-page__infra-meta--muted">
					{t('pages.settings.infra.status.notTestedYet')}
				</span>
			) : lastTest.kind === 'success' ? (
				<span className="settings-page__infra-meta">
					{t('pages.settings.infra.status.lastTestSuccess')} · {lastTest.detail}
				</span>
			) : (
				<span className="settings-page__infra-meta settings-page__infra-meta--warn">
					{t('pages.settings.infra.status.lastTestFailed')}: {lastTest.message}
				</span>
			)}
		</div>
	);
}

export function InfraDevQuickLinks({ links }: InfraDevQuickLinksProps) {
	const { t } = useTranslation('common');
	return (
		<p className="settings-page__infra-links">
			{links.map((link, index) => (
				<span key={link.href}>
					{index > 0 && ' · '}
					<a
						href={link.href}
						className="settings-page__infra-link"
						target={link.external ? '_blank' : undefined}
						rel={link.external ? 'noopener noreferrer' : undefined}
					>
						{t(link.labelKey)}
					</a>
				</span>
			))}
		</p>
	);
}
