import { useTranslation } from 'react-i18next';
import { useInfraWorkerConfig } from '@/hooks/api/useAdminInfraApi';
import { MailerConfigPanel } from './MailerConfigPanel';
import { PushSmokePanel } from './PushSmokePanel';
import { SearchHealthPanel } from './SearchHealthPanel';

/** Settings section: smoke-test mail, push, and search workers (independent of global AI switch). */
export function InfrastructureWorkersSection() {
	const { t } = useTranslation('common');
	const { data: workerConfig, isLoading: configLoading } = useInfraWorkerConfig();

	return (
		<section className="settings-page__section" aria-labelledby="settings-infra-heading">
			<div className="settings-page__section-head">
				<h2 id="settings-infra-heading" className="settings-page__section-title">
					{t('pages.settings.infra.sectionTitle')}
				</h2>
				<p className="settings-page__section-desc">{t('pages.settings.infra.description')}</p>
			</div>
			<div className="settings-page__section-body settings-page__infra">
				<MailerConfigPanel workerConfig={workerConfig} configLoading={configLoading} />
				<PushSmokePanel workerConfig={workerConfig} configLoading={configLoading} />
				<SearchHealthPanel />
			</div>
		</section>
	);
}
