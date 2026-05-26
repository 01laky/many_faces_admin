import { useTranslation } from 'react-i18next';
import { adminInfraDevLinks } from '@/config/adminInfraDevLinks';
import { useMailerTestSelf } from '@/hooks/api/useAdminInfraApi';
import { useConfirmModal } from '@/hooks/useConfirmModal';
import { useInfraSmokeTest } from '@/hooks/useInfraSmokeTest';
import { resolveAdminInfraErrorMessage } from '@/utils/resolveAdminInfraErrorMessage';
import { readMailConfigured } from '@/utils/adminInfraStatusStrip';
import { Button } from '@/components/radix/Button';
import { InfraDevQuickLinks, InfraStatusStrip } from './InfraPanelShared';

import type { MailerSmokePanelProps } from './types';

export function MailerSmokePanel({ workerConfig, configLoading }: MailerSmokePanelProps) {
	const { t } = useTranslation('common');
	const mailerTest = useMailerTestSelf();
	const { confirm, ConfirmModalHost } = useConfirmModal();
	const { runTest, lastTest, lastResult } = useInfraSmokeTest({
		confirm,
		t,
		messageKey: 'pages.settings.infra.mail.confirm',
		cancelLabelKey: 'pages.settings.aiSystem.confirm.cancel',
		confirmLabelKey: 'pages.settings.infra.mail.send',
		successToastKey: 'pages.settings.infra.mail.success',
		mutateAsync: () => mailerTest.mutateAsync(),
		getSuccessDetail: (result) => result.correlationId ?? '',
		resolveError: resolveAdminInfraErrorMessage,
	});

	const configured = readMailConfigured(workerConfig);

	return (
		<div id="settings-infra-mail" className="settings-page__subsection settings-page__infra-panel">
			<h3 className="settings-page__subsection-title">{t('pages.settings.infra.mail.title')}</h3>
			<p className="settings-page__subsection-desc">{t('pages.settings.infra.mail.description')}</p>
			<p className="settings-page__field-hint">{t('pages.settings.infra.mail.hint')}</p>
			<InfraDevQuickLinks
				links={[
					{
						href: adminInfraDevLinks.mailpitUi,
						labelKey: 'pages.settings.infra.links.mailpit',
						external: true,
					},
					{
						href: adminInfraDevLinks.mailerGuide,
						labelKey: 'pages.settings.infra.links.mailerGuide',
					},
				]}
			/>
			{!configLoading && <InfraStatusStrip configured={configured} lastTest={lastTest} />}
			<Button
				type="button"
				variant="secondary"
				disabled={mailerTest.isPending || configLoading}
				onClick={() => void runTest()}
			>
				{mailerTest.isPending ? t('common.loading') : t('pages.settings.infra.mail.send')}
			</Button>
			{lastResult && (
				<dl className="settings-page__infra-result">
					<div>
						<dt>{t('pages.settings.infra.result.correlationId')}</dt>
						<dd>{lastResult.correlationId}</dd>
					</div>
					{lastResult.smtpMessageId && (
						<div>
							<dt>{t('pages.settings.infra.result.smtpMessageId')}</dt>
							<dd>{lastResult.smtpMessageId}</dd>
						</div>
					)}
				</dl>
			)}
			{ConfirmModalHost}
		</div>
	);
}
