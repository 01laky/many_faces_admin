import { useTranslation } from 'react-i18next';
import type { SearchHealthDto } from '@/api/models/SearchHealthDto';
import { adminInfraDevLinks } from '@/config/adminInfraDevLinks';
import { useRefreshSearchHealth, useSearchHealth } from '@/hooks/api/useAdminInfraApi';
import { resolveSearchHealthUiState } from '@/utils/adminInfraSearchHealth';
import { Button } from '@/components/radix/Button';
import { InfraDevQuickLinks } from './InfraPanelShared';

type SearchHealthPanelProps = {
	data?: SearchHealthDto;
	isLoading?: boolean;
	isError?: boolean;
	onRefresh?: () => void;
	refreshPending?: boolean;
};

export function SearchHealthPanelBody({
	data,
	isLoading,
	isError,
}: Pick<SearchHealthPanelProps, 'data' | 'isLoading' | 'isError'>) {
	const { t } = useTranslation('common');

	if (isLoading) {
		return <p className="settings-page__field-hint">{t('common.loading')}</p>;
	}

	if (isError) {
		return (
			<p className="settings-page__field-hint settings-page__field-hint--error">
				{t('pages.settings.infra.errors.generic')}
			</p>
		);
	}

	const state = resolveSearchHealthUiState(data);
	const modifier = state === 'healthy' ? 'ok' : state === 'unreachable' ? 'warn' : 'off';

	return (
		<div className={`settings-page__infra-status settings-page__infra-status--${modifier}`}>
			<span className="settings-page__infra-badge">
				{t(`pages.settings.infra.status.${state === 'disabled' ? 'disabled' : state}`)}
			</span>
			{data?.clusterName && <span className="settings-page__infra-meta">{data.clusterName}</span>}
			{data?.message && state !== 'healthy' && (
				<span className="settings-page__infra-meta settings-page__infra-meta--warn">
					{data.message}
				</span>
			)}
		</div>
	);
}

export function SearchHealthPanel() {
	const { t } = useTranslation('common');
	const { data, isLoading, isError } = useSearchHealth();
	const refresh = useRefreshSearchHealth();

	return (
		<div
			id="settings-infra-search"
			className="settings-page__subsection settings-page__infra-panel"
		>
			<div className="settings-page__subsection-header">
				<h3 className="settings-page__subsection-title">
					{t('pages.settings.infra.search.title')}
				</h3>
				<Button
					type="button"
					variant="secondary"
					disabled={refresh.isPending || isLoading}
					onClick={() => refresh.mutate()}
				>
					{refresh.isPending ? t('common.loading') : t('pages.settings.infra.search.refresh')}
				</Button>
			</div>
			<p className="settings-page__subsection-desc">
				{t('pages.settings.infra.search.description')}
			</p>
			<p className="settings-page__field-hint">{t('pages.settings.infra.search.hint')}</p>
			<InfraDevQuickLinks
				links={[
					{
						href: adminInfraDevLinks.searchGuide,
						labelKey: 'pages.settings.infra.links.searchGuide',
					},
				]}
			/>
			<SearchHealthPanelBody data={data} isLoading={isLoading} isError={isError} />
		</div>
	);
}
