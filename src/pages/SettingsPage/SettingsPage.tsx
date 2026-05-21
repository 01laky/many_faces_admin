import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AdminAiPublicStatsMode } from '@/utils/adminAiStatsSettings';
import { getAdminAiPublicStatsMode, setAdminAiPublicStatsMode } from '@/utils/adminAiStatsSettings';
import {
	adminAiLiveParallelDefaults,
	clampLiveParallelBundleCalls,
	getAdminAiLiveMaxParallelBundleCalls,
	setAdminAiLiveMaxParallelBundleCalls,
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
	useOperatorAiWorkerHostProfile,
	useUpdateOperatorAiLiveStatsCacheSettings,
} from '@/hooks/api/useOperatorAiApi';
import { formatBytes } from '@/utils/formatBytes';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Button } from '@/components/radix/Button';
import { FormField } from '@/components/radix/FormField';
import { Input } from '@/components/radix/Input';
import { AiWorkerHostSection } from './AiWorkerHostPanel';
import './SettingsPage.scss';

const MODES: AdminAiPublicStatsMode[] = ['off', 'inline', 'live'];

export function SettingsPage() {
	const { t } = useTranslation('common');
	const [mode, setMode] = useState<AdminAiPublicStatsMode>(() => getAdminAiPublicStatsMode());
	const initialParallel = getAdminAiLiveMaxParallelBundleCalls();
	const [parallel, setParallel] = useState(initialParallel);
	const [parallelDraft, setParallelDraft] = useState(String(initialParallel));
	const [saved, setSaved] = useState(false);
	const [saveError, setSaveError] = useState<string | null>(null);
	const { data: workerHost } = useOperatorAiWorkerHostProfile();
	const {
		data: liveStatsCache,
		isLoading: liveStatsCacheLoading,
		isError: liveStatsCacheError,
	} = useOperatorAiLiveStatsCacheSettings();
	const updateLiveStatsCache = useUpdateOperatorAiLiveStatsCacheSettings();
	const [cacheTtlMinutesDraft, setCacheTtlMinutesDraft] = useState<string | null>(null);
	const parallelRecommendation = recommendLiveParallelBundleCalls(workerHost?.profile);

	const cacheTtlDisplay =
		cacheTtlMinutesDraft ??
		(liveStatsCache?.ttlMilliseconds != null
			? String(ttlMillisecondsToMinutes(liveStatsCache.ttlMilliseconds))
			: String(liveStatsCacheDefaults.DEFAULT_MINUTES));

	const commitParallelDraft = useCallback((raw: string, fallback: number) => {
		const trimmed = raw.trim();
		if (!trimmed) {
			const clamped = clampLiveParallelBundleCalls(fallback);
			setParallel(clamped);
			setParallelDraft(String(clamped));
			return clamped;
		}
		const parsed = Number.parseInt(trimmed, 10);
		if (!Number.isFinite(parsed)) {
			setParallel(fallback);
			setParallelDraft(String(fallback));
			return fallback;
		}
		const clamped = clampLiveParallelBundleCalls(parsed);
		setParallel(clamped);
		setParallelDraft(String(clamped));
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

			setAdminAiPublicStatsMode(mode);
			const effective = commitParallelDraft(parallelDraft, parallel);
			setAdminAiLiveMaxParallelBundleCalls(effective);
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
		t,
	]);

	const onParallelChange = (raw: string) => {
		if (raw === '' || /^\d+$/.test(raw)) {
			setParallelDraft(raw);
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
		setParallel(clamped);
		setParallelDraft(String(clamped));
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
						<FormField
							label={t('pages.settings.general.languageLabel')}
							htmlFor="settings-language"
						>
							<LanguageSwitcher variant="settings" id="settings-language" />
						</FormField>
						<p className="settings-page__field-hint">{t('pages.settings.general.languageHint')}</p>
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
											onChange={() => setMode(m)}
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
								<>
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
								</>
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
