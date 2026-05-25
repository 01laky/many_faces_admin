import { useTranslation } from 'react-i18next';
import type { InfraLastTestOutcome } from '@/utils/adminInfraStatusStrip';
import {
	resolveInfraConfiguredBadge,
	resolveInfraStatusModifier,
} from '@/utils/adminInfraStatusStrip';
import {
	resolveMailEffectiveStatusBadge,
	resolveMailEffectiveStatusModifier,
} from '@/utils/adminMailEffectiveStatus';

type InfraStatusStripProps = {
	configured?: boolean | undefined;
	/** When set, mail panel uses pages.settings.infra.mail.config.status.* badges (AMC-U5). */
	effectiveStatus?: string;
	deviceCount?: number;
	lastTest?: InfraLastTestOutcome;
	updatedAtUtc?: string;
};

/** Read-only configured / effective-status / last-test strip shared by mail and push panels. */
export function InfraStatusStrip({
	configured,
	effectiveStatus,
	deviceCount,
	lastTest,
	updatedAtUtc,
}: InfraStatusStripProps) {
	const { t } = useTranslation('common');
	const usesMailEffectiveStatus = effectiveStatus != null;
	const badge = usesMailEffectiveStatus
		? resolveMailEffectiveStatusBadge(effectiveStatus, configured)
		: resolveInfraConfiguredBadge(configured);
	const modifier = usesMailEffectiveStatus
		? resolveMailEffectiveStatusModifier(effectiveStatus, { lastTest })
		: resolveInfraStatusModifier(configured, { deviceCount, lastTest });
	const badgeKeyPrefix = usesMailEffectiveStatus
		? 'pages.settings.infra.mail.config.status'
		: 'pages.settings.infra.status';

	return (
		<div className={`settings-page__infra-status settings-page__infra-status--${modifier}`}>
			<span className="settings-page__infra-badge">{t(`${badgeKeyPrefix}.${badge}`)}</span>
			{deviceCount != null && configured && !usesMailEffectiveStatus && (
				<span className="settings-page__infra-meta">
					{t('pages.settings.infra.push.deviceCount', { count: deviceCount })}
				</span>
			)}
			{updatedAtUtc && usesMailEffectiveStatus && (
				<span className="settings-page__infra-meta settings-page__infra-meta--muted">
					{t('pages.settings.infra.mail.config.status.updatedAt', {
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

type DevQuickLinksProps = {
	links: Array<{ href: string; labelKey: string; external?: boolean }>;
};

export function InfraDevQuickLinks({ links }: DevQuickLinksProps) {
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
