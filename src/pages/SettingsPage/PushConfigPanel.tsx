import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import type { AdminInfraWorkerConfigDto } from '@/api/models/AdminInfraWorkerConfigDto';
import type { PushTestSelfResultDto } from '@/api/models/PushTestSelfResultDto';
import { adminInfraDevLinks } from '@/config/adminInfraDevLinks';
import { usePushTestSelf } from '@/hooks/api/useAdminInfraApi';
import {
	useAdminPushSettings,
	useTestAdminPushFcm,
	useUpdateAdminPushSettings,
} from '@/hooks/api/useAdminPushSettingsApi';
import { useConfirmModal } from '@/hooks/useConfirmModal';
import { useInfraSmokeTest } from '@/hooks/useInfraSmokeTest';
import { resolveAdminInfraErrorMessage } from '@/utils/resolveAdminInfraErrorMessage';
import {
	readPushConfigured,
	readPushDeviceCount,
	readPushEffectiveStatus,
} from '@/utils/adminInfraStatusStrip';
import {
	adminPushSaveNeedsDisableConfirm,
	adminPushSaveNeedsFirebaseJsonConfirm,
	adminPushSaveNeedsWorkerUrlConfirm,
	adminPushSettingsDtoToFormDraft,
	buildUpdateAdminPushSettingsRequest,
	isAdminPushSettingsFormDirty,
	isAdminPushSettingsFormSubmittable,
	type AdminPushSettingsFormDraft,
	validateAdminPushFirebaseJson,
	validateAdminPushGrpcDeadline,
	validateAdminPushLocKeys,
	validateAdminPushWorkerGrpcUrl,
} from '@/utils/adminPushSettingsValidation';
import { Button } from '@/components/radix/Button';
import { FormField } from '@/components/radix/FormField';
import { Input } from '@/components/radix/Input';
import { InfraDevQuickLinks, InfraStatusStrip } from './InfraPanelShared';

type PushConfigPanelProps = {
	workerConfig?: AdminInfraWorkerConfigDto;
	configLoading?: boolean;
};

function validationMessageKey(
	field:
		| ReturnType<typeof validateAdminPushWorkerGrpcUrl>
		| ReturnType<typeof validateAdminPushLocKeys>
		| ReturnType<typeof validateAdminPushGrpcDeadline>
		| ReturnType<typeof validateAdminPushFirebaseJson>
): string | undefined {
	if (!field) return undefined;
	return `pages.settings.infra.push.config.validation.${field}`;
}

export function PushConfigPanel({ workerConfig, configLoading }: PushConfigPanelProps) {
	const { t } = useTranslation('common');
	const {
		data: pushSettings,
		isLoading: settingsLoading,
		isError: settingsError,
	} = useAdminPushSettings();
	const updateSettings = useUpdateAdminPushSettings();
	const testFcm = useTestAdminPushFcm();
	const pushTest = usePushTestSelf();
	const { confirm, ConfirmModalHost } = useConfirmModal();
	const jsonFileInputRef = useRef<HTMLInputElement>(null);
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

	const baseline = useMemo(
		() => (pushSettings ? adminPushSettingsDtoToFormDraft(pushSettings) : null),
		[pushSettings]
	);
	const [draft, setDraft] = useState<AdminPushSettingsFormDraft | null>(null);
	const effectiveDraft = draft ?? baseline;
	const baselineHasCredentials = pushSettings?.firebase.hasCredentials ?? false;

	const patchDraft = useCallback(
		(patch: Partial<AdminPushSettingsFormDraft>) => {
			setDraft((prev) => ({ ...(prev ?? baseline!), ...patch }));
		},
		[baseline]
	);

	const configured = readPushConfigured(workerConfig);
	const deviceCount = readPushDeviceCount(workerConfig);
	const effectiveStatus =
		pushSettings?.effectiveStatus ?? readPushEffectiveStatus(workerConfig) ?? undefined;
	const loading = configLoading || settingsLoading;
	const dirty = baseline != null && draft != null && isAdminPushSettingsFormDirty(draft, baseline);
	const submittable =
		effectiveDraft != null &&
		isAdminPushSettingsFormSubmittable(effectiveDraft, baselineHasCredentials);
	const saveDisabled =
		loading || settingsError || !dirty || !submittable || updateSettings.isPending;

	const workerUrlError = effectiveDraft
		? validateAdminPushWorkerGrpcUrl(effectiveDraft.workerGrpcUrl, effectiveDraft.enabled)
		: null;
	const locKeyError = effectiveDraft
		? validateAdminPushLocKeys(effectiveDraft, effectiveDraft.enabled)
		: null;
	const grpcDeadlineError = effectiveDraft
		? validateAdminPushGrpcDeadline(effectiveDraft.grpcDeadlineSeconds, effectiveDraft.enabled)
		: null;
	const firebaseJsonError = effectiveDraft
		? validateAdminPushFirebaseJson(effectiveDraft, baselineHasCredentials, effectiveDraft.enabled)
		: null;

	const runSaveWithConfirms = useCallback(async () => {
		if (!effectiveDraft || !baseline || draft == null) return;

		if (adminPushSaveNeedsDisableConfirm(baseline, effectiveDraft)) {
			const confirmed = await confirm({
				message: t('pages.settings.infra.push.config.confirm.disable.message'),
				cancelLabel: t('pages.settings.aiSystem.confirm.cancel'),
				confirmLabel: t('pages.settings.infra.push.config.confirm.disable.confirm'),
				confirmVariant: 'danger',
			});
			if (!confirmed) return;
		}

		if (adminPushSaveNeedsWorkerUrlConfirm(baseline, effectiveDraft)) {
			const confirmed = await confirm({
				message: t('pages.settings.infra.push.config.confirm.workerUrl.message'),
				cancelLabel: t('pages.settings.aiSystem.confirm.cancel'),
				confirmLabel: t('pages.settings.infra.push.config.confirm.workerUrl.confirm'),
			});
			if (!confirmed) return;
		}

		if (adminPushSaveNeedsFirebaseJsonConfirm(effectiveDraft, baselineHasCredentials)) {
			const confirmed = await confirm({
				message: t('pages.settings.infra.push.config.confirm.firebaseJson.message'),
				cancelLabel: t('pages.settings.aiSystem.confirm.cancel'),
				confirmLabel: t('pages.settings.infra.push.config.confirm.firebaseJson.confirm'),
			});
			if (!confirmed) return;
		}

		try {
			await updateSettings.mutateAsync(buildUpdateAdminPushSettingsRequest(effectiveDraft));
			setDraft(null);
			toast.success(t('pages.settings.infra.push.config.saveSuccess'));
		} catch {
			toast.error(t('pages.settings.infra.push.config.saveError'));
		}
	}, [baseline, baselineHasCredentials, confirm, draft, effectiveDraft, t, updateSettings]);

	const onTestFcm = useCallback(async () => {
		if (dirty) {
			toast.info(t('pages.settings.infra.push.config.testFcm.saveFirstHint'));
			return;
		}
		try {
			const result = await testFcm.mutateAsync();
			if (result.fcmReachable) {
				toast.success(
					result.message ??
						t('pages.settings.infra.push.config.testFcm.success', {
							projectId: result.projectId ?? '',
						})
				);
			} else {
				toast.error(result.message ?? t('pages.settings.infra.push.config.testFcm.failure'));
			}
		} catch {
			toast.error(t('pages.settings.infra.push.config.testFcm.failure'));
		}
	}, [dirty, t, testFcm]);

	const onJsonFileSelected = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const file = event.target.files?.[0];
			event.target.value = '';
			if (!file) return;

			const reader = new FileReader();
			reader.onload = () => {
				const text = typeof reader.result === 'string' ? reader.result : '';
				patchDraft({
					firebaseServiceAccountJson: text,
					clearFirebaseServiceAccountJson: false,
				});
			};
			reader.readAsText(file);
		},
		[patchDraft]
	);

	const workerAuthPlaceholder = useMemo(() => {
		if (effectiveDraft?.clearWorkerAuthToken) return '';
		if (pushSettings?.hasWorkerAuthToken) {
			return t('pages.settings.infra.push.config.workerAuthToken.placeholderSet');
		}
		return t('pages.settings.infra.push.config.workerAuthToken.placeholderEmpty');
	}, [effectiveDraft?.clearWorkerAuthToken, pushSettings?.hasWorkerAuthToken, t]);

	const firebaseJsonPlaceholder = useMemo(() => {
		if (effectiveDraft?.clearFirebaseServiceAccountJson) return '';
		if (pushSettings?.firebase.hasCredentials) {
			return t('pages.settings.infra.push.config.firebase.serviceAccountJson.placeholderSet');
		}
		return t('pages.settings.infra.push.config.firebase.serviceAccountJson.placeholderEmpty');
	}, [effectiveDraft?.clearFirebaseServiceAccountJson, pushSettings?.firebase.hasCredentials, t]);

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

			{!loading && (effectiveStatus != null || configured != null) && (
				<InfraStatusStrip
					configured={configured}
					effectiveStatus={effectiveStatus}
					effectiveStatusNamespace="push"
					deviceCount={deviceCount}
					lastTest={lastTest}
					updatedAtUtc={pushSettings?.updatedAtUtc}
				/>
			)}

			{settingsLoading ? (
				<p className="settings-page__field-hint">{t('common.loading')}</p>
			) : settingsError ? (
				<p className="settings-page__field-hint settings-page__field-hint--error">
					{t('pages.settings.infra.push.config.loadError')}
				</p>
			) : effectiveDraft ? (
				<div className="settings-page__push-config">
					<div className="settings-page__push-config-section">
						<h4 className="settings-page__push-config-heading">
							{t('pages.settings.infra.push.config.platform.sectionTitle')}
						</h4>

						<div className="settings-page__push-config-row">
							<FormField
								label={t('pages.settings.infra.push.config.enabled.label')}
								htmlFor="push-config-enabled"
							>
								<button
									id="push-config-enabled"
									type="button"
									className={`settings-page__switch ${effectiveDraft.enabled ? 'settings-page__switch--on' : 'settings-page__switch--off'}`}
									role="switch"
									aria-checked={effectiveDraft.enabled}
									disabled={updateSettings.isPending}
									onClick={() => patchDraft({ enabled: !effectiveDraft.enabled })}
								>
									<span className="settings-page__switch-knob" />
								</button>
							</FormField>
							<p className="settings-page__field-hint">
								{t('pages.settings.infra.push.config.enabled.hint')}
							</p>
						</div>

						<div className="settings-page__push-config-grid">
							<FormField
								label={t('pages.settings.infra.push.config.workerGrpcUrl.label')}
								htmlFor="push-config-worker-url"
								error={workerUrlError ? t(validationMessageKey(workerUrlError)!) : undefined}
								required={effectiveDraft.enabled}
							>
								<Input
									id="push-config-worker-url"
									value={effectiveDraft.workerGrpcUrl}
									disabled={updateSettings.isPending}
									onChange={(e) => patchDraft({ workerGrpcUrl: e.target.value })}
								/>
							</FormField>

							<FormField
								label={t('pages.settings.infra.push.config.workerAuthToken.label')}
								htmlFor="push-config-worker-token"
							>
								<div className="settings-page__push-config-secret-row">
									<Input
										id="push-config-worker-token"
										type="password"
										autoComplete="new-password"
										value={effectiveDraft.workerAuthToken}
										placeholder={workerAuthPlaceholder}
										disabled={updateSettings.isPending || effectiveDraft.clearWorkerAuthToken}
										onChange={(e) =>
											patchDraft({
												workerAuthToken: e.target.value,
												clearWorkerAuthToken: false,
											})
										}
									/>
									{pushSettings?.hasWorkerAuthToken && !effectiveDraft.clearWorkerAuthToken && (
										<Button
											type="button"
											variant="outline"
											disabled={updateSettings.isPending}
											onClick={() =>
												patchDraft({ workerAuthToken: '', clearWorkerAuthToken: true })
											}
										>
											{t('pages.settings.infra.push.config.clearSecret')}
										</Button>
									)}
								</div>
							</FormField>

							<FormField
								label={t('pages.settings.infra.push.config.titleLocKey.label')}
								htmlFor="push-config-title-loc-key"
								error={
									locKeyError === 'titleLocKeyRequired' || locKeyError === 'invalidLocKey'
										? t(validationMessageKey(locKeyError)!)
										: undefined
								}
								required={effectiveDraft.enabled}
							>
								<Input
									id="push-config-title-loc-key"
									value={effectiveDraft.titleLocKey}
									disabled={updateSettings.isPending}
									onChange={(e) => patchDraft({ titleLocKey: e.target.value })}
								/>
							</FormField>

							<FormField
								label={t('pages.settings.infra.push.config.bodyLocKey.label')}
								htmlFor="push-config-body-loc-key"
								error={
									locKeyError === 'bodyLocKeyRequired' || locKeyError === 'invalidLocKey'
										? t(validationMessageKey(locKeyError)!)
										: undefined
								}
								required={effectiveDraft.enabled}
							>
								<Input
									id="push-config-body-loc-key"
									value={effectiveDraft.bodyLocKey}
									disabled={updateSettings.isPending}
									onChange={(e) => patchDraft({ bodyLocKey: e.target.value })}
								/>
							</FormField>

							<FormField
								label={t('pages.settings.infra.push.config.androidChannelId.label')}
								htmlFor="push-config-android-channel"
							>
								<Input
									id="push-config-android-channel"
									value={effectiveDraft.androidChannelId}
									disabled={updateSettings.isPending}
									onChange={(e) => patchDraft({ androidChannelId: e.target.value })}
								/>
							</FormField>

							<FormField
								label={t('pages.settings.infra.push.config.grpcDeadlineSeconds.label')}
								htmlFor="push-config-grpc-deadline"
								error={grpcDeadlineError ? t(validationMessageKey(grpcDeadlineError)!) : undefined}
								required={effectiveDraft.enabled}
							>
								<Input
									id="push-config-grpc-deadline"
									inputMode="numeric"
									value={effectiveDraft.grpcDeadlineSeconds}
									disabled={updateSettings.isPending}
									onChange={(e) => {
										if (e.target.value === '' || /^\d+$/.test(e.target.value)) {
											patchDraft({ grpcDeadlineSeconds: e.target.value });
										}
									}}
								/>
							</FormField>
						</div>
					</div>

					<div className="settings-page__push-config-section">
						<h4 className="settings-page__push-config-heading">
							{t('pages.settings.infra.push.config.firebase.sectionTitle')}
						</h4>

						<div className="settings-page__push-config-grid">
							<FormField
								label={t('pages.settings.infra.push.config.firebase.projectId.label')}
								htmlFor="push-config-project-id"
							>
								<Input
									id="push-config-project-id"
									value={pushSettings?.firebase.projectId ?? ''}
									readOnly
									disabled
								/>
							</FormField>

							<FormField
								label={t('pages.settings.infra.push.config.firebase.serviceAccountJson.label')}
								htmlFor="push-config-firebase-json"
								error={firebaseJsonError ? t(validationMessageKey(firebaseJsonError)!) : undefined}
								required={effectiveDraft.enabled && !baselineHasCredentials}
							>
								<div className="settings-page__push-config-secret-row">
									<Input
										id="push-config-firebase-json"
										type="password"
										autoComplete="new-password"
										value={effectiveDraft.firebaseServiceAccountJson}
										placeholder={firebaseJsonPlaceholder}
										disabled={
											updateSettings.isPending || effectiveDraft.clearFirebaseServiceAccountJson
										}
										onChange={(e) =>
											patchDraft({
												firebaseServiceAccountJson: e.target.value,
												clearFirebaseServiceAccountJson: false,
											})
										}
									/>
									<input
										ref={jsonFileInputRef}
										type="file"
										accept=".json,application/json"
										className="settings-page__push-config-file-input"
										onChange={onJsonFileSelected}
									/>
									<Button
										type="button"
										variant="outline"
										disabled={updateSettings.isPending}
										onClick={() => jsonFileInputRef.current?.click()}
									>
										{t('pages.settings.infra.push.config.firebase.uploadJson')}
									</Button>
									{pushSettings?.firebase.hasCredentials &&
										!effectiveDraft.clearFirebaseServiceAccountJson && (
											<Button
												type="button"
												variant="outline"
												disabled={updateSettings.isPending}
												onClick={() =>
													patchDraft({
														firebaseServiceAccountJson: '',
														clearFirebaseServiceAccountJson: true,
													})
												}
											>
												{t('pages.settings.infra.push.config.clearSecret')}
											</Button>
										)}
								</div>
							</FormField>

							<p className="settings-page__field-hint">
								{pushSettings?.firebase.hasCredentials &&
								!effectiveDraft.clearFirebaseServiceAccountJson
									? t('pages.settings.infra.push.config.firebase.credentialsConfigured')
									: t('pages.settings.infra.push.config.firebase.credentialsMissing')}
							</p>
						</div>
					</div>

					{pushSettings?.transport && (
						<div className="settings-page__push-config-section">
							<h4 className="settings-page__push-config-heading">
								{t('pages.settings.infra.push.config.transport.sectionTitle')}
							</h4>
							<p className="settings-page__field-hint">
								{pushSettings.transport.tlsConfiguredViaEnv
									? t('pages.settings.infra.push.config.transport.tlsConfigured')
									: t('pages.settings.infra.push.config.transport.tlsNotConfigured')}
								{' · '}
								{pushSettings.transport.mtlsConfiguredViaEnv
									? t('pages.settings.infra.push.config.transport.mtlsConfigured')
									: t('pages.settings.infra.push.config.transport.mtlsNotConfigured')}
							</p>
						</div>
					)}

					<div className="settings-page__push-config-actions">
						<Button
							type="button"
							disabled={saveDisabled}
							onClick={() => void runSaveWithConfirms()}
						>
							{updateSettings.isPending
								? t('common.loading')
								: t('pages.settings.infra.push.config.save')}
						</Button>
						<Button
							type="button"
							variant="secondary"
							disabled={testFcm.isPending || loading || settingsError || dirty}
							onClick={() => void onTestFcm()}
						>
							{testFcm.isPending
								? t('common.loading')
								: t('pages.settings.infra.push.config.testFcm.action')}
						</Button>
					</div>
				</div>
			) : null}

			<div className="settings-page__push-config-smoke">
				<h4 className="settings-page__push-config-heading">
					{t('pages.settings.infra.push.config.smoke.sectionTitle')}
				</h4>
				<p className="settings-page__field-hint">
					{t('pages.settings.infra.push.config.smoke.hint')}
				</p>
				<Button
					type="button"
					variant="secondary"
					disabled={pushTest.isPending || loading}
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
			</div>

			{ConfirmModalHost}
		</div>
	);
}
