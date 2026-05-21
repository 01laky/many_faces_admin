import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AdminAiPublicStatsMode } from '@/utils/adminAiStatsSettings';
import { getAdminAiPublicStatsMode, setAdminAiPublicStatsMode } from '@/utils/adminAiStatsSettings';
import {
	adminAiLiveParallelDefaults,
	getAdminAiLiveMaxParallelBundleCalls,
	setAdminAiLiveMaxParallelBundleCalls,
} from '@/utils/adminAiLiveParallelSettings';
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
	const [parallel, setParallel] = useState(() => getAdminAiLiveMaxParallelBundleCalls());
	const [saved, setSaved] = useState(false);

	const onSave = useCallback(() => {
		setAdminAiPublicStatsMode(mode);
		setAdminAiLiveMaxParallelBundleCalls(parallel);
		setSaved(true);
		window.setTimeout(() => setSaved(false), 2500);
	}, [mode, parallel]);

	const onParallelChange = (raw: string) => {
		const parsed = Number(raw);
		if (!Number.isFinite(parsed)) return;
		const clamped = Math.min(
			adminAiLiveParallelDefaults.MAX,
			Math.max(adminAiLiveParallelDefaults.MIN, parsed)
		);
		setParallel(clamped);
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
											type="number"
											min={adminAiLiveParallelDefaults.MIN}
											max={adminAiLiveParallelDefaults.MAX}
											value={parallel}
											onChange={(e) => onParallelChange(e.target.value)}
										/>
									</FormField>
									<p className="settings-page__field-hint">
										{t('pages.settings.aiStats.liveParallel.hint')}
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
				</div>
			</footer>
		</div>
	);
}
