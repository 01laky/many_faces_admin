import { useTranslation } from 'react-i18next';
import type { PushTestSelfResultDto } from '@/api/models/PushTestSelfResultDto';
import type { AdminInfraWorkerConfigDto } from '@/api/models/AdminInfraWorkerConfigDto';
import { adminInfraDevLinks } from '@/config/adminInfraDevLinks';
import { usePushTestSelf } from '@/hooks/api/useAdminInfraApi';
import { useConfirmModal } from '@/hooks/useConfirmModal';
import { useInfraSmokeTest } from '@/hooks/useInfraSmokeTest';
import { resolveAdminInfraErrorMessage } from '@/utils/resolveAdminInfraErrorMessage';
import { readPushConfigured, readPushDeviceCount } from '@/utils/adminInfraStatusStrip';
import { Button } from '@/components/radix/Button';
import { InfraDevQuickLinks, InfraStatusStrip } from './InfraPanelShared';

type PushSmokePanelProps = {
	workerConfig?: AdminInfraWorkerConfigDto;
	configLoading?: boolean;
};

export function PushSmokePanel({ workerConfig, configLoading }: PushSmokePanelProps) {
	const { t } = useTranslation('common');
	const pushTest = usePushTestSelf();
	const { confirm, ConfirmModalHost } = useConfirmModal();
	const { runTest, lastTest, lastResult } = useInfraSmokeTest<PushTestSelfResultDto>({
		confirm,
		t,
		messageKey: 'pages.settings.infra.push.confirm',
		cancelLabelKey: 'pages.settings.aiSystem.confirm.cancel',
		confirmLabelKey: 'pages.settings.infra.push.send',
		successToastKey: 'pages.settings.infra.push.success',
		mutateAsync: () => pushTest.mutateAsync(),
		getSuccessDetail: (result) => String(result.sent),
		resolveError: resolveAdminInfraErrorMessage,
	});

	const configured = readPushConfigured(workerConfig);
	const deviceCount = readPushDeviceCount(workerConfig);

	return (
		<div id="settings-infra-push" className="settings-page__subsection settings-page__infra-panel">
			<h3 className="settings-page__subsection-title">{t('pages.settings.infra.push.title')}</h3>
			<p className="settings-page__subsection-desc">{t('pages.settings.infra.push.description')}</p>
			<p className="settings-page__field-hint">{t('pages.settings.infra.push.hint')}</p>
			<InfraDevQuickLinks
				links={[
					{ href: adminInfraDevLinks.pushGuide, labelKey: 'pages.settings.infra.links.pushGuide' },
				]}
			/>
			{!configLoading && (
				<InfraStatusStrip configured={configured} deviceCount={deviceCount} lastTest={lastTest} />
			)}
			<Button
				type="button"
				variant="secondary"
				disabled={pushTest.isPending || configLoading}
				onClick={() => void runTest()}
			>
				{pushTest.isPending ? t('common.loading') : t('pages.settings.infra.push.send')}
			</Button>
			{lastResult && (
				<dl className="settings-page__infra-result">
					<div>
						<dt>{t('pages.settings.infra.result.sent')}</dt>
						<dd>{lastResult.sent}</dd>
					</div>
					<div>
						<dt>{t('pages.settings.infra.result.failed')}</dt>
						<dd>{lastResult.failed}</dd>
					</div>
					<div>
						<dt>{t('pages.settings.infra.result.prunedInvalidTokens')}</dt>
						<dd>{lastResult.prunedInvalidTokens}</dd>
					</div>
				</dl>
			)}
			{ConfirmModalHost}
		</div>
	);
}
