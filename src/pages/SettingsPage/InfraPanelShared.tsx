import { useTranslation } from 'react-i18next';
import type { InfraLastTestOutcome } from '@/utils/adminInfraStatusStrip';
import {
	resolveInfraConfiguredBadge,
	resolveInfraStatusModifier,
} from '@/utils/adminInfraStatusStrip';

type InfraStatusStripProps = {
	configured: boolean | undefined;
	deviceCount?: number;
	lastTest?: InfraLastTestOutcome;
};

/** Read-only configured / last-test strip shared by mail and push panels. */
export function InfraStatusStrip({ configured, deviceCount, lastTest }: InfraStatusStripProps) {
	const { t } = useTranslation('common');
	const badge = resolveInfraConfiguredBadge(configured);
	const modifier = resolveInfraStatusModifier(configured, { deviceCount, lastTest });

	return (
		<div className={`settings-page__infra-status settings-page__infra-status--${modifier}`}>
			<span className="settings-page__infra-badge">
				{t(`pages.settings.infra.status.${badge}`)}
			</span>
			{deviceCount != null && configured && (
				<span className="settings-page__infra-meta">
					{t('pages.settings.infra.push.deviceCount', { count: deviceCount })}
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
