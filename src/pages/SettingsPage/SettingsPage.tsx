import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
	adminAiPublicStatsDefaults,
	normalizeAdminAiPublicStatsMode,
	type AdminAiPublicStatsMode,
} from '@/utils/adminAiStatsSettings';
import {
	adminAiLiveParallelDefaults,
	clampLiveParallelBundleCalls,
	normalizeLiveParallelBundleCalls,
} from '@/utils/adminAiLiveParallelSettings';
import { recommendLiveParallelBundleCalls } from '@/utils/adminAiLiveParallelRecommendation';
import {
	clampLiveStatsCacheMinutes,
	liveStatsCacheDefaults,
	minutesToTtlMilliseconds,
	ttlMillisecondsToMinutes,
} from '@/utils/adminAiLiveStatsCacheSettings';
import {
	useOperatorAiLiveStatsCacheSettings,
	useOperatorAiPublicStatsSettings,
	useOperatorAiWorkerHostProfile,
	useUpdateOperatorAiLiveStatsCacheSettings,
	useUpdateOperatorAiPublicStatsSettings,
} from '@/hooks/api/useOperatorAiApi';
import type { OperatorAiPublicStatsSettingsDto } from '@/api/models/OperatorAiPublicStatsSettingsDto';
import { formatBytes } from '@/utils/formatBytes';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Button } from '@/components/radix/Button';
import { FormField } from '@/components/radix/FormField';
import { Input } from '@/components/radix/Input';
import { AiWorkerHostSection } from './AiWorkerHostPanel';
import './SettingsPage.scss';

const MODES: AdminAiPublicStatsMode[] = ['off', 'inline', 'live'];

function resolvePublicStatsDraft(
	settings: OperatorAiPublicStatsSettingsDto | undefined,
	localMode: AdminAiPublicStatsMode | null,
	localParallel: number | null,
	localParallelDraft: string | null
) {
	const serverMode = normalizeAdminAiPublicStatsMode(
		settings?.publicStatsMode ?? adminAiPublicStatsDefaults.DEFAULT_MODE
	);
	const serverParallel = normalizeLiveParallelBundleCalls(settings?.liveMaxParallelBundleCalls);
	const mode = localMode ?? serverMode;
	const parallel = localParallel ?? serverParallel;
	const parallelDraft = localParallelDraft ?? String(parallel);
	return { mode, parallel, parallelDraft };
}

export function SettingsPage() {
	const { t } = useTranslation('common');
	const [localMode, setLocalMode] = useState<AdminAiPublicStatsMode | null>(null);
	const [localParallel, setLocalParallel] = useState<number | null>(null);
	const [localParallelDraft, setLocalParallelDraft] = useState<string | null>(null);
	const [saved, setSaved] = useState(false);
	const [saveError, setSaveError] = useState<string | null>(null);
	const { data: workerHost } = useOperatorAiWorkerHostProfile();
	const {
		data: publicStatsSettings,
		isLoading: publicStatsLoading,
		isError: publicStatsError,
	} = useOperatorAiPublicStatsSettings();
	const {
		data: liveStatsCache,
		isLoading: liveStatsCacheLoading,
		isError: liveStatsCacheError,
	} = useOperatorAiLiveStatsCacheSettings();
	const updateLiveStatsCache = useUpdateOperatorAiLiveStatsCacheSettings();
	const updatePublicStatsSettings = useUpdateOperatorAiPublicStatsSettings();
	const [cacheTtlMinutesDraft, setCacheTtlMinutesDraft] = useState<string | null>(null);
	const parallelRecommendation = recommendLiveParallelBundleCalls(workerHost?.profile);
	const { mode, parallel, parallelDraft } = resolvePublicStatsDraft(
		publicStatsSettings,
		localMode,
		localParallel,
		localParallelDraft
	);

	const cacheTtlDisplay =
		cacheTtlMinutesDraft ??
		(liveStatsCache?.ttlMilliseconds != null
			? String(ttlMillisecondsToMinutes(liveStatsCache.ttlMilliseconds))
			: String(liveStatsCacheDefaults.DEFAULT_MINUTES));

	const commitParallelDraft = useCallback((raw: string, fallback: number) => {
		const trimmed = raw.trim();
		if (!trimmed) {
			const clamped = clampLiveParallelBundleCalls(fallback);
			setLocalParallel(clamped);
			setLocalParallelDraft(String(clamped));
			return clamped;
		}
		const parsed = Number.parseInt(trimmed, 10);
		if (!Number.isFinite(parsed)) {
			setLocalParallel(fallback);
			setLocalParallelDraft(String(fallback));
			return fallback;
		}
		const clamped = clampLiveParallelBundleCalls(parsed);
		setLocalParallel(clamped);
		setLocalParallelDraft(String(clamped));
		return clamped;
	}, []);

	const onSave = useCallback(async () => {
		setSaveError(null);
		try {
			const parsedMinutes = Number.parseInt(cacheTtlDisplay.trim(), 10);
			const bounds = liveStatsCache ?? {
				minTtlMilliseconds: 30_000,
				maxTtlMilliseconds: 3_600_000,
			};
			const minutes = Number.isFinite(parsedMinutes)
				? clampLiveStatsCacheMinutes(
						parsedMinutes,
						bounds.minTtlMilliseconds,
						bounds.maxTtlMilliseconds
					)
				: liveStatsCacheDefaults.DEFAULT_MINUTES;
			setCacheTtlMinutesDraft(String(minutes));

			await updateLiveStatsCache.mutateAsync({
				ttlMilliseconds: minutesToTtlMilliseconds(minutes),
			});

			const effective = commitParallelDraft(parallelDraft, parallel);
			await updatePublicStatsSettings.mutateAsync({
				publicStatsMode: mode,
				liveMaxParallelBundleCalls: effective,
			});
			setLocalMode(null);
			setLocalParallel(null);
			setLocalParallelDraft(null);
			setSaved(true);
			window.setTimeout(() => setSaved(false), 2500);
		} catch {
			setSaveError(t('pages.settings.aiStats.liveCache.saveError'));
		}
	}, [
		mode,
		parallel,
		parallelDraft,
		commitParallelDraft,
		cacheTtlDisplay,
		liveStatsCache,
		updateLiveStatsCache,
		updatePublicStatsSettings,
		t,
	]);

	const onParallelChange = (raw: string) => {
		if (raw === '' || /^\d+$/.test(raw)) {
			setLocalParallelDraft(raw);
		}
	};

	const onParallelBlur = () => {
		commitParallelDraft(parallelDraft, parallel);
	};

	const onCacheTtlChange = (raw: string) => {
		if (raw === '' || /^\d+$/.test(raw)) {
			setCacheTtlMinutesDraft(raw);
		}
	};

	const onCacheTtlBlur = () => {
		const parsed = Number.parseInt(cacheTtlDisplay.trim(), 10);
		if (!Number.isFinite(parsed)) {
			setCacheTtlMinutesDraft(String(liveStatsCacheDefaults.DEFAULT_MINUTES));
			return;
		}
		const bounds = liveStatsCache ?? {
			minTtlMilliseconds: 30_000,
			maxTtlMilliseconds: 3_600_000,
		};
		setCacheTtlMinutesDraft(
			String(
				clampLiveStatsCacheMinutes(parsed, bounds.minTtlMilliseconds, bounds.maxTtlMilliseconds)
			)
		);
	};

	const applyRecommendedParallel = (value: number) => {
		const clamped = clampLiveParallelBundleCalls(value);
		setLocalParallel(clamped);
		setLocalParallelDraft(String(clamped));
	};

	return (
		<div className="settings-page">
			<header className="settings-page__header">
				<h1 className="settings-page__title">{t('pages.settings.title')}</h1>
				<p className="settings-page__lead">{t('pages.settings.lead')}</p>
			</header>

			<div className="settings-page__sections">
				<section className="settings-page__section" aria-labelledby="settings-general-heading">
					<div className="settings-page__section-head">
						<h2 id="settings-general-heading" className="settings-page__section-title">
							{t('pages.settings.general.sectionTitle')}
						</h2>
						<p className="settings-page__section-desc">{t('pages.settings.general.description')}</p>
					</div>

					<div className="settings-page__section-body">
						<div className="settings-page__compact-field">
							<FormField
								label={t('pages.settings.general.languageLabel')}
								htmlFor="settings-language"
							>
								<LanguageSwitcher variant="settings" id="settings-language" />
							</FormField>
							<p className="settings-page__field-hint">
								{t('pages.settings.general.languageHint')}
							</p>
						</div>
					</div>
				</section>

				<section className="settings-page__section" aria-labelledby="settings-ai-heading">
					<div className="settings-page__section-head">
						<h2 id="settings-ai-heading" className="settings-page__section-title">
							{t('pages.settings.aiConfiguration.sectionTitle')}
						</h2>
						<p className="settings-page__section-desc">
							{t('pages.settings.aiConfiguration.description')}
						</p>
					</div>

					<div className="settings-page__section-body">
						<div className="settings-page__subsection">
							<h3 className="settings-page__subsection-title">
								{t('pages.settings.aiStats.sectionTitle')}
							</h3>
							<p className="settings-page__subsection-desc">
								{t('pages.settings.aiStats.description')}
							</p>

							{publicStatsLoading ? (
								<p className="settings-page__field-hint">
									{t('pages.settings.aiStats.liveCache.loading')}
								</p>
							) : publicStatsError ? (
								<p className="settings-page__field-hint settings-page__field-hint--error">
									{t('pages.settings.aiStats.liveCache.error')}
								</p>
							) : (
								<>
									<div
										className="settings-page__options"
										role="radiogroup"
										aria-label={t('pages.settings.aiStats.sectionTitle')}
									>
										{MODES.map((m) => (
											<label
												key={m}
												className={`settings-page__option ${mode === m ? 'is-selected' : ''}`}
											>
												<input
													type="radio"
													name="ai-public-stats-mode"
													value={m}
													checked={mode === m}
													onChange={() => setLocalMode(m)}
												/>
												<span className="settings-page__option-label">
													{t(`pages.settings.aiStats.modes.${m}`)}
												</span>
												<span className="settings-page__option-hint">
													{t(`pages.settings.aiStats.hints.${m}`)}
												</span>
											</label>
										))}
									</div>

									{mode === 'live' && (
										<div className="settings-page__parallel">
											<FormField
												label={t('pages.settings.aiStats.liveParallel.label')}
												htmlFor="ai-live-parallel"
											>
												<Input
													id="ai-live-parallel"
													type="text"
													inputMode="numeric"
													autoComplete="off"
													min={adminAiLiveParallelDefaults.MIN}
													max={adminAiLiveParallelDefaults.MAX}
													value={parallelDraft}
													onChange={(e) => onParallelChange(e.target.value)}
													onBlur={onParallelBlur}
												/>
											</FormField>
											<p className="settings-page__field-hint">
												{t('pages.settings.aiStats.liveParallel.hint', {
													max: adminAiLiveParallelDefaults.MAX,
												})}
											</p>
											{parallelRecommendation ? (
												<div className="settings-page__parallel-recommendation">
													<p className="settings-page__parallel-recommendation-text">
														{t('pages.settings.aiStats.liveParallel.recommendation', {
															gpu:
																parallelRecommendation.basis.gpuName ??
																t('pages.settings.aiStats.liveParallel.unknownGpu'),
															vram: parallelRecommendation.basis.vramBytes
																? formatBytes(parallelRecommendation.basis.vramBytes)
																: t('pages.settings.aiStats.liveParallel.unknownVram'),
															ram: parallelRecommendation.basis.ramAvailableBytes
																? formatBytes(parallelRecommendation.basis.ramAvailableBytes)
																: t('pages.settings.aiStats.liveParallel.unknownRam'),
															recommended: parallelRecommendation.recommended,
															upperBound: parallelRecommendation.upperBound,
														})}
													</p>
													{parallel !== parallelRecommendation.recommended && (
														<Button
															type="button"
															variant="secondary"
															onClick={() =>
																applyRecommendedParallel(parallelRecommendation.recommended)
															}
														>
															{t('pages.settings.aiStats.liveParallel.applyRecommended', {
																value: parallelRecommendation.recommended,
															})}
														</Button>
													)}
												</div>
											) : (
												<p className="settings-page__field-hint settings-page__field-hint--muted">
													{t('pages.settings.aiStats.liveParallel.recommendationFallback')}
												</p>
											)}
										</div>
									)}
								</>
							)}
						</div>

						<div className="settings-page__subsection">
							<h3 className="settings-page__subsection-title">
								{t('pages.settings.aiStats.liveCache.sectionLabel')}
							</h3>
							{liveStatsCacheLoading ? (
								<p className="settings-page__field-hint">
									{t('pages.settings.aiStats.liveCache.loading')}
								</p>
							) : liveStatsCacheError ? (
								<p className="settings-page__field-hint settings-page__field-hint--error">
									{t('pages.settings.aiStats.liveCache.error')}
								</p>
							) : (
								<div className="settings-page__compact-field">
									<FormField
										label={t('pages.settings.aiStats.liveCache.ttlLabel')}
										htmlFor="ai-live-cache-ttl"
									>
										<Input
											id="ai-live-cache-ttl"
											type="text"
											inputMode="numeric"
											autoComplete="off"
											value={cacheTtlDisplay}
											onChange={(e) => onCacheTtlChange(e.target.value)}
											onBlur={onCacheTtlBlur}
										/>
									</FormField>
									<p className="settings-page__field-hint">
										{t('pages.settings.aiStats.liveCache.ttlHint', {
											defaultMinutes: liveStatsCacheDefaults.DEFAULT_MINUTES,
										})}
									</p>
								</div>
							)}
						</div>

						<AiWorkerHostSection />
					</div>
				</section>
			</div>

			<footer className="settings-page__footer">
				<div className="settings-page__actions">
					<Button type="button" onClick={onSave}>
						{t('pages.settings.save')}
					</Button>
					{saved && <span className="settings-page__saved">{t('pages.settings.saved')}</span>}
					{saveError && (
						<span className="settings-page__saved settings-page__saved--error">{saveError}</span>
					)}
				</div>
			</footer>
		</div>
	);
}
