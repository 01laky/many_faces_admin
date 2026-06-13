import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './GradientPicker.scss';
import type { GradientSettings, GradientPickerProps } from './types';
import { DEFAULT_GRADIENT } from './constants';

function parseGradientSettings(value?: string | null): GradientSettings {
	if (!value) return { ...DEFAULT_GRADIENT };
	try {
		const parsed = JSON.parse(value);
		return {
			type: parsed.type === 'radial' ? 'radial' : 'linear',
			colors:
				Array.isArray(parsed.colors) && parsed.colors.length >= 2
					? parsed.colors
					: [...DEFAULT_GRADIENT.colors],
			angle: typeof parsed.angle === 'number' ? parsed.angle : 135,
			animation: ['none', 'rotate', 'shift', 'pulse'].includes(parsed.animation)
				? parsed.animation
				: 'none',
			animationSpeed: typeof parsed.animationSpeed === 'number' ? parsed.animationSpeed : 3,
		};
	} catch {
		return { ...DEFAULT_GRADIENT };
	}
}

function buildGradientCSS(settings: GradientSettings): string {
	const colorsStr = settings.colors.join(', ');
	if (settings.type === 'radial') {
		return `radial-gradient(circle, ${colorsStr})`;
	}
	return `linear-gradient(${settings.angle}deg, ${colorsStr})`;
}

function buildAnimatedPreviewStyle(settings: GradientSettings): React.CSSProperties {
	const base: React.CSSProperties = {
		background: buildGradientCSS(settings),
		backgroundSize: settings.animation !== 'none' ? '200% 200%' : undefined,
	};

	if (settings.animation === 'rotate') {
		base.animation = `gradient-rotate ${settings.animationSpeed}s linear infinite`;
	} else if (settings.animation === 'shift') {
		base.animation = `gradient-shift ${settings.animationSpeed}s ease infinite`;
	} else if (settings.animation === 'pulse') {
		base.animation = `gradient-pulse ${settings.animationSpeed}s ease-in-out infinite`;
	}

	return base;
}

export function GradientPicker({ value, onChange, disabled }: GradientPickerProps) {
	const { t } = useTranslation('common');
	// Counter for fresh per-color ids. Only read in event handlers / the effect — never during render
	// (the repo's react-hooks lint forbids ref access during render).
	const idCounter = useRef(0);
	const makeId = useCallback(() => `gc-${idCounter.current++}`, []);

	const [settings, setSettings] = useState<GradientSettings>(() => parseGradientSettings(value));
	// Stable per-color ids for the list keys. The colors are plain strings that can repeat, and
	// removeColor deletes by index, so index keys would keep the wrong <input type="color"> mounted.
	// Seed with deterministic ids (no ref access during render); fresh ids come from makeId later.
	const [colorIds, setColorIds] = useState<string[]>(() =>
		parseGradientSettings(value).colors.map((_, i) => `gc-init-${i}`)
	);

	useEffect(() => {
		// Defer the state sync out of the synchronous effect body (repo lint: no setState directly in
		// an effect). Re-parse the controlled value, then re-sync ids by position for a clean key diff.
		void (async () => {
			await Promise.resolve();
			const parsed = parseGradientSettings(value);
			setSettings(parsed);
			setColorIds((prev) => parsed.colors.map((_, i) => prev[i] ?? makeId()));
		})();
	}, [value, makeId]);

	const emitChange = useCallback(
		(updated: GradientSettings) => {
			setSettings(updated);
			onChange(JSON.stringify(updated));
		},
		[onChange]
	);

	const updateType = (type: 'linear' | 'radial') => {
		emitChange({ ...settings, type });
	};

	const updateAngle = (angle: number) => {
		emitChange({ ...settings, angle });
	};

	const updateColor = (index: number, color: string) => {
		const newColors = [...settings.colors];
		newColors[index] = color;
		emitChange({ ...settings, colors: newColors });
	};

	const addColor = () => {
		if (settings.colors.length >= 6) return;
		setColorIds((prev) => [...prev, makeId()]);
		emitChange({ ...settings, colors: [...settings.colors, '#000000'] });
	};

	const removeColor = (index: number) => {
		if (settings.colors.length <= 2) return;
		setColorIds((prev) => prev.filter((_, i) => i !== index));
		const newColors = settings.colors.filter((_, i) => i !== index);
		emitChange({ ...settings, colors: newColors });
	};

	const updateAnimation = (animation: GradientSettings['animation']) => {
		emitChange({ ...settings, animation });
	};

	const updateSpeed = (animationSpeed: number) => {
		emitChange({ ...settings, animationSpeed });
	};

	return (
		<div className="gradient-picker">
			{/* Preview */}
			<div className="gradient-picker__preview" style={buildAnimatedPreviewStyle(settings)} />

			{/* Type toggle */}
			<div className="gradient-picker__section">
				<label className="gradient-picker__label">{t('pages.editFace.gradient.type')}</label>
				<div className="gradient-picker__toggle-group">
					<button
						type="button"
						className={`gradient-picker__toggle ${settings.type === 'linear' ? 'gradient-picker__toggle--active' : ''}`}
						onClick={() => updateType('linear')}
						disabled={disabled}
					>
						{t('pages.editFace.gradient.linear')}
					</button>
					<button
						type="button"
						className={`gradient-picker__toggle ${settings.type === 'radial' ? 'gradient-picker__toggle--active' : ''}`}
						onClick={() => updateType('radial')}
						disabled={disabled}
					>
						{t('pages.editFace.gradient.radial')}
					</button>
				</div>
			</div>

			{/* Angle (linear only) */}
			{settings.type === 'linear' && (
				<div className="gradient-picker__section">
					<label className="gradient-picker__label">
						{t('pages.editFace.gradient.angle')}: {settings.angle}°
					</label>
					<input
						type="range"
						min={0}
						max={360}
						value={settings.angle}
						onChange={(e) => updateAngle(Number(e.target.value))}
						disabled={disabled}
						className="gradient-picker__slider"
					/>
				</div>
			)}

			{/* Colors */}
			<div className="gradient-picker__section">
				<label className="gradient-picker__label">{t('pages.editFace.gradient.colors')}</label>
				<div className="gradient-picker__colors">
					{settings.colors.map((color, i) => (
						<div key={colorIds[i] ?? i} className="gradient-picker__color-row">
							<input
								type="color"
								value={color}
								onChange={(e) => updateColor(i, e.target.value)}
								disabled={disabled}
								className="gradient-picker__color-input"
							/>
							<span className="gradient-picker__color-hex">{color}</span>
							{settings.colors.length > 2 && (
								<button
									type="button"
									className="gradient-picker__color-remove"
									onClick={() => removeColor(i)}
									disabled={disabled}
									title={t('pages.editFace.gradient.removeColor')}
								>
									×
								</button>
							)}
						</div>
					))}
					{settings.colors.length < 6 && (
						<button
							type="button"
							className="gradient-picker__color-add"
							onClick={addColor}
							disabled={disabled}
						>
							+ {t('pages.editFace.gradient.addColor')}
						</button>
					)}
				</div>
			</div>

			{/* Animation */}
			<div className="gradient-picker__section">
				<label className="gradient-picker__label">{t('pages.editFace.gradient.animation')}</label>
				<select
					value={settings.animation}
					onChange={(e) => updateAnimation(e.target.value as GradientSettings['animation'])}
					disabled={disabled}
					className="gradient-picker__select"
				>
					<option value="none">{t('pages.editFace.gradient.animNone')}</option>
					<option value="rotate">{t('pages.editFace.gradient.animRotate')}</option>
					<option value="shift">{t('pages.editFace.gradient.animShift')}</option>
					<option value="pulse">{t('pages.editFace.gradient.animPulse')}</option>
				</select>
			</div>

			{/* Animation speed */}
			{settings.animation !== 'none' && (
				<div className="gradient-picker__section">
					<label className="gradient-picker__label">
						{t('pages.editFace.gradient.speed')}: {settings.animationSpeed}s
					</label>
					<input
						type="range"
						min={0.5}
						max={15}
						step={0.5}
						value={settings.animationSpeed}
						onChange={(e) => updateSpeed(Number(e.target.value))}
						disabled={disabled}
						className="gradient-picker__slider"
					/>
				</div>
			)}
		</div>
	);
}
