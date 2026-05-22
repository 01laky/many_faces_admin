import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import type { MailerTestSelfResultDto } from '@/api/models/MailerTestSelfResultDto';
import { adminInfraDevLinks } from '@/config/adminInfraDevLinks';
import { useMailerTestSelf } from '@/hooks/api/useAdminInfraApi';
import { useConfirmModal } from '@/hooks/useConfirmModal';
import { resolveAdminInfraErrorMessage } from '@/utils/resolveAdminInfraErrorMessage';
import type { InfraLastTestOutcome } from '@/utils/adminInfraStatusStrip';
import { readMailConfigured } from '@/utils/adminInfraStatusStrip';
import type { AdminInfraWorkerConfigDto } from '@/api/models/AdminInfraWorkerConfigDto';
import { Button } from '@/components/radix/Button';
import { InfraDevQuickLinks, InfraStatusStrip } from './InfraPanelShared';

type MailerSmokePanelProps = {
	workerConfig?: AdminInfraWorkerConfigDto;
	configLoading?: boolean;
};

export function MailerSmokePanel({ workerConfig, configLoading }: MailerSmokePanelProps) {
	const { t } = useTranslation('common');
	const mailerTest = useMailerTestSelf();
	const { confirm, ConfirmModalHost } = useConfirmModal();
	const [lastTest, setLastTest] = useState<InfraLastTestOutcome>({ kind: 'none' });
	const [lastResult, setLastResult] = useState<MailerTestSelfResultDto | null>(null);

	const runTest = useCallback(async () => {
		await confirm({
			message: t('pages.settings.infra.mail.confirm'),
			cancelLabel: t('pages.settings.aiSystem.confirm.cancel'),
			confirmLabel: t('pages.settings.infra.mail.send'),
			confirmAction: async () => {
				try {
					const result = await mailerTest.mutateAsync();
					setLastResult(result);
					setLastTest({
						kind: 'success',
						at: new Date(),
						detail: result.correlationId,
					});
					toast.success(t('pages.settings.infra.mail.success'));
				} catch (err) {
					const message = resolveAdminInfraErrorMessage(t, err);
					setLastTest({ kind: 'failure', at: new Date(), message });
					toast.error(message);
					throw err;
				}
			},
		});
	}, [confirm, mailerTest, t]);

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
