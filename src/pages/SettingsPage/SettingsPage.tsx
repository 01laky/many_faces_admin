import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AdminAiPublicStatsMode } from '@/utils/adminAiStatsSettings';
import { getAdminAiPublicStatsMode, setAdminAiPublicStatsMode } from '@/utils/adminAiStatsSettings';
import {
	adminAiLiveParallelDefaults,
	getAdminAiLiveMaxParallelBundleCalls,
	setAdminAiLiveMaxParallelBundleCalls,
} from '@/utils/adminAiLiveParallelSettings';
import { Button } from '@/components/radix/Button';
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

	return (
		<div className="settings-page">
			<h1 className="settings-page__title">{t('pages.settings.title')}</h1>
			<p className="settings-page__lead">{t('pages.settings.lead')}</p>

			<section className="settings-page__card" aria-labelledby="ai-stats-heading">
				<h2 id="ai-stats-heading" className="settings-page__card-title">
					{t('pages.settings.aiStats.sectionTitle')}
				</h2>
				<p className="settings-page__card-desc">{t('pages.settings.aiStats.description')}</p>

				<div
					className="settings-page__options"
					role="radiogroup"
					aria-label={t('pages.settings.aiStats.sectionTitle')}
				>
					{MODES.map((m) => (
						<label key={m} className={`settings-page__option ${mode === m ? 'is-selected' : ''}`}>
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

				<div className="settings-page__parallel">
					<label className="settings-page__parallel-label" htmlFor="ai-live-parallel">
						{t('pages.settings.aiStats.liveParallel.label')}
					</label>
					<input
						id="ai-live-parallel"
						type="number"
						min={adminAiLiveParallelDefaults.MIN}
						max={adminAiLiveParallelDefaults.MAX}
						value={parallel}
						onChange={(e) => setParallel(Number(e.target.value))}
					/>
					<p className="settings-page__option-hint">
						{t('pages.settings.aiStats.liveParallel.hint')}
					</p>
				</div>

				<div className="settings-page__actions">
					<Button type="button" onClick={onSave}>
						{t('pages.settings.save')}
					</Button>
					{saved && <span className="settings-page__saved">{t('pages.settings.saved')}</span>}
				</div>
			</section>
		</div>
	);
}
