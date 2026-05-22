import { useTranslation } from 'react-i18next';
import type {
	OperatorAiWorkerHostDto,
	OperatorAiWorkerHostProfile,
	OperatorAiWorkerHostProfileDisk,
} from '@/api/models/OperatorAiWorkerHostDto';
import {
	useOperatorAiWorkerHostProfile,
	useRefreshOperatorAiWorkerHostProfile,
} from '@/hooks/api/useOperatorAiApi';
import { Button } from '@/components/radix/Button';
import {
	formatWorkerHostBytes,
	isWorkerHostProfileStale,
	topWorkerHostDisks,
} from './aiWorkerHostViewUtils';

function formatBytes(value?: number): string {
	return formatWorkerHostBytes(value);
}

function isProfileStale(profile: OperatorAiWorkerHostProfile | null | undefined): boolean {
	return isWorkerHostProfileStale(profile);
}

function topDisks(disks: OperatorAiWorkerHostProfileDisk[] | undefined) {
	return topWorkerHostDisks(disks);
}

type PanelProps = {
	data?: OperatorAiWorkerHostDto;
	isLoading?: boolean;
	isError?: boolean;
};

export function AiWorkerHostPanel({ data, isLoading, isError }: PanelProps) {
	const { t } = useTranslation('common');

	if (isLoading) {
		return (
			<p className="settings-page__worker-host-message">
				{t('pages.settings.aiWorkerHost.loading')}
			</p>
		);
	}

	if (isError) {
		return (
			<p className="settings-page__worker-host-message settings-page__worker-host-message--error">
				{t('pages.settings.aiWorkerHost.error')}
			</p>
		);
	}

	const profile = data?.profile ?? null;
	if (!profile) {
		return (
			<div className="settings-page__worker-host">
				{data?.reachable === false && (
					<p className="settings-page__worker-host-banner settings-page__worker-host-banner--warn">
						{t('pages.settings.aiWorkerHost.unreachable')}
					</p>
				)}
				<p className="settings-page__worker-host-message">
					{t('pages.settings.aiWorkerHost.noProfile')}
				</p>
			</div>
		);
	}

	const stale = isProfileStale(profile) || data?.reachable === false;
	const scope = profile.scope ?? 'host';
	const disks = topDisks(profile.disks);
	const runtime = profile.aiRuntime;
	const detail = runtime?.ollamaModelDetail;
	const loaded = runtime?.ollamaLoadedModels ?? [];

	return (
		<div className="settings-page__worker-host">
			{data?.reachable === false && (
				<p className="settings-page__worker-host-banner settings-page__worker-host-banner--warn">
					{t('pages.settings.aiWorkerHost.unreachable')}
				</p>
			)}
			{stale && data?.reachable !== false && (
				<p className="settings-page__worker-host-banner settings-page__worker-host-banner--warn">
					{t('pages.settings.aiWorkerHost.stale')}
				</p>
			)}

			<dl className="settings-page__worker-host-grid">
				<div>
					<dt>{t('pages.settings.aiWorkerHost.os')}</dt>
					<dd>
						{profile.os?.displayName ?? profile.os?.family ?? '—'}
						{profile.hostname ? ` · ${profile.hostname}` : ''}
					</dd>
				</div>
				<div>
					<dt>{t('pages.settings.aiWorkerHost.scopeLabel')}</dt>
					<dd>
						<span
							className={`settings-page__scope-badge settings-page__scope-badge--${scope === 'container' ? 'container' : 'host'}`}
						>
							{scope === 'container'
								? t('pages.settings.aiWorkerHost.scopeContainer')
								: t('pages.settings.aiWorkerHost.scopeHost')}
						</span>
					</dd>
				</div>
				<div>
					<dt>{t('pages.settings.aiWorkerHost.cpu')}</dt>
					<dd>
						{profile.cpu?.logicalCores != null ? `${profile.cpu.logicalCores} cores` : '—'}
						{profile.cpu?.modelName ? ` · ${profile.cpu.modelName}` : ''}
					</dd>
				</div>
				<div>
					<dt>{t('pages.settings.aiWorkerHost.gpu')}</dt>
					<dd>
						{profile.gpu?.devices?.length ? (
							<ul className="settings-page__worker-host-list">
								{profile.gpu.devices.map((device) => (
									<li key={device.name ?? device.vendor}>
										{device.name ?? 'GPU'}
										{device.vramBytes != null ? ` (${formatBytes(device.vramBytes)} VRAM)` : ''}
									</li>
								))}
							</ul>
						) : (
							t('pages.settings.aiWorkerHost.gpuNone')
						)}
					</dd>
				</div>
				<div>
					<dt>{t('pages.settings.aiWorkerHost.memory')}</dt>
					<dd>
						{formatBytes(profile.memory?.ramTotalBytes)} total ·{' '}
						{formatBytes(profile.memory?.ramAvailableBytes)} available
					</dd>
				</div>
				<div>
					<dt>{t('pages.settings.aiWorkerHost.swap')}</dt>
					<dd>
						{formatBytes(profile.memory?.swapTotalBytes)} total ·{' '}
						{formatBytes(profile.memory?.swapUsedBytes)} used
					</dd>
				</div>
				{disks.length > 0 && (
					<div className="settings-page__worker-host-span">
						<dt>{t('pages.settings.aiWorkerHost.disk')}</dt>
						<dd>
							<ul className="settings-page__worker-host-list">
								{disks.map(({ disk, usedPct }) => (
									<li key={disk.mountPoint ?? disk.fsType}>
										{disk.mountPoint ?? '—'} — {usedPct}% used ({formatBytes(disk.freeBytes)} free)
									</li>
								))}
							</ul>
						</dd>
					</div>
				)}
				<div className="settings-page__worker-host-span">
					<dt>{t('pages.settings.aiWorkerHost.model')}</dt>
					<dd>
						{runtime?.ollamaModelConfigured ?? '—'}
						{runtime?.ollamaReachable === false && (
							<span className="settings-page__worker-host-tag">
								{t('pages.settings.aiWorkerHost.ollamaUnreachable')}
							</span>
						)}
						{runtime?.ollamaReachable === true && (
							<span className="settings-page__worker-host-tag settings-page__worker-host-tag--ok">
								{t('pages.settings.aiWorkerHost.ollamaReachable')}
							</span>
						)}
					</dd>
				</div>
				{(runtime?.ollamaContextLength != null || runtime?.ollamaNumGpu != null) && (
					<div>
						<dt>{t('pages.settings.aiWorkerHost.ollamaContext')}</dt>
						<dd>
							{runtime.ollamaContextLength != null ? runtime.ollamaContextLength : '—'}
							{runtime.ollamaNumGpu != null
								? ` · ${t('pages.settings.aiWorkerHost.ollamaGpuLayers', { count: runtime.ollamaNumGpu })}`
								: ''}
						</dd>
					</div>
				)}
				{detail && (
					<div className="settings-page__worker-host-span">
						<dt>{t('pages.settings.aiWorkerHost.ollamaModelDetail')}</dt>
						<dd>
							{[
								detail.parameterSize &&
									`${t('pages.settings.aiWorkerHost.ollamaParameterSize')}: ${detail.parameterSize}`,
								detail.quantizationLevel &&
									`${t('pages.settings.aiWorkerHost.ollamaQuantization')}: ${detail.quantizationLevel}`,
								detail.modelSizeBytes != null &&
									`${t('pages.settings.aiWorkerHost.ollamaModelSize')}: ${formatBytes(detail.modelSizeBytes)}`,
							]
								.filter(Boolean)
								.join(' · ')}
						</dd>
					</div>
				)}
				{loaded.length > 0 && (
					<div className="settings-page__worker-host-span">
						<dt>{t('pages.settings.aiWorkerHost.ollamaLoadedModels')}</dt>
						<dd>
							<ul className="settings-page__worker-host-list">
								{loaded.map((item) => (
									<li key={item.name ?? item.processor}>
										{item.name ?? '—'}
										{item.sizeVramBytes != null
											? ` · ${t('pages.settings.aiWorkerHost.ollamaVram')}: ${formatBytes(item.sizeVramBytes)}`
											: ''}
										{item.processor
											? ` · ${t('pages.settings.aiWorkerHost.ollamaProcessor')}: ${item.processor}`
											: ''}
									</li>
								))}
							</ul>
						</dd>
					</div>
				)}
				<div>
					<dt>{t('pages.settings.aiWorkerHost.lastUpdated')}</dt>
					<dd>{profile.collectedAtUtc ?? '—'}</dd>
				</div>
				<div>
					<dt>{t('pages.settings.aiWorkerHost.grpcAddress')}</dt>
					<dd>{data?.grpcAddressConfigured ?? '—'}</dd>
				</div>
			</dl>
		</div>
	);
}

export function AiWorkerHostSection({
	aiInteractionDisabled = false,
}: {
	aiInteractionDisabled?: boolean;
}) {
	const { t } = useTranslation('common');
	const { data, isLoading, isError } = useOperatorAiWorkerHostProfile();
	const refresh = useRefreshOperatorAiWorkerHostProfile();

	return (
		<div className="settings-page__subsection settings-page__subsection--worker-host">
			<div className="settings-page__subsection-header">
				<h3 className="settings-page__subsection-title">
					{t('pages.settings.aiWorkerHost.sectionTitle')}
				</h3>
				<Button
					type="button"
					variant="secondary"
					disabled={refresh.isPending || aiInteractionDisabled}
					onClick={() => refresh.mutate()}
				>
					{refresh.isPending
						? t('pages.settings.aiWorkerHost.refreshing')
						: t('pages.settings.aiWorkerHost.refresh')}
				</Button>
			</div>
			<p className="settings-page__subsection-desc">
				{t('pages.settings.aiWorkerHost.description')}
			</p>
			<AiWorkerHostPanel data={data} isLoading={isLoading} isError={isError} />
		</div>
	);
}
