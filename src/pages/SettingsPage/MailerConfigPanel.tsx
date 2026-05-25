import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import type { AdminInfraWorkerConfigDto } from '@/api/models/AdminInfraWorkerConfigDto';
import type { MailerTestSelfResultDto } from '@/api/models/MailerTestSelfResultDto';
import { adminInfraDevLinks } from '@/config/adminInfraDevLinks';
import { useMailerTestSelf } from '@/hooks/api/useAdminInfraApi';
import {
	useAdminMailSettings,
	useTestAdminMailSmtp,
	useUpdateAdminMailSettings,
} from '@/hooks/api/useAdminMailSettingsApi';
import { useConfirmModal } from '@/hooks/useConfirmModal';
import { useInfraSmokeTest } from '@/hooks/useInfraSmokeTest';
import { resolveAdminInfraErrorMessage } from '@/utils/resolveAdminInfraErrorMessage';
import {
	ADMIN_MAIL_SUPPORTED_LOCALES,
	adminMailSaveNeedsDisableConfirm,
	adminMailSaveNeedsSmtpHostConfirm,
	adminMailSaveNeedsWorkerUrlConfirm,
	adminMailSettingsDtoToFormDraft,
	buildUpdateAdminMailSettingsRequest,
	isAdminMailSettingsFormDirty,
	isAdminMailSettingsFormSubmittable,
	type AdminMailSettingsFormDraft,
	validateAdminMailDefaultLocale,
	validateAdminMailRegistrationPathTemplate,
	validateAdminMailSmtpFields,
	validateAdminMailWorkerGrpcUrl,
} from '@/utils/adminMailSettingsValidation';
import { readMailConfigured } from '@/utils/adminInfraStatusStrip';
import { Button } from '@/components/radix/Button';
import { FormField } from '@/components/radix/FormField';
import { Input } from '@/components/radix/Input';
import { InfraDevQuickLinks, InfraStatusStrip } from './InfraPanelShared';

type MailerConfigPanelProps = {
	workerConfig?: AdminInfraWorkerConfigDto;
	configLoading?: boolean;
};

function validationMessageKey(
	field:
		| ReturnType<typeof validateAdminMailDefaultLocale>
		| ReturnType<typeof validateAdminMailRegistrationPathTemplate>
		| ReturnType<typeof validateAdminMailWorkerGrpcUrl>
		| ReturnType<typeof validateAdminMailSmtpFields>
): string | undefined {
	if (!field) return undefined;
	return `pages.settings.infra.mail.config.validation.${field}`;
}

export function MailerConfigPanel({ workerConfig, configLoading }: MailerConfigPanelProps) {
	const { t } = useTranslation('common');
	const {
		data: mailSettings,
		isLoading: settingsLoading,
		isError: settingsError,
	} = useAdminMailSettings();
	const updateSettings = useUpdateAdminMailSettings();
	const testSmtp = useTestAdminMailSmtp();
	const mailerTest = useMailerTestSelf();
	const { confirm, ConfirmModalHost } = useConfirmModal();
	const { runTest, lastTest, lastResult } = useInfraSmokeTest<MailerTestSelfResultDto>({
		confirm,
		t,
		messageKey: 'pages.settings.infra.mail.confirm',
		cancelLabelKey: 'pages.settings.aiSystem.confirm.cancel',
		confirmLabelKey: 'pages.settings.infra.mail.send',
		successToastKey: 'pages.settings.infra.mail.success',
		mutateAsync: () => mailerTest.mutateAsync(),
		getSuccessDetail: (result) => result.correlationId ?? '',
		resolveError: resolveAdminInfraErrorMessage,
	});

	const baseline = useMemo(
		() => (mailSettings ? adminMailSettingsDtoToFormDraft(mailSettings) : null),
		[mailSettings]
	);
	const [draft, setDraft] = useState<AdminMailSettingsFormDraft | null>(null);
	const effectiveDraft = draft ?? baseline;

	const patchDraft = useCallback(
		(patch: Partial<AdminMailSettingsFormDraft>) => {
			setDraft((prev) => ({ ...(prev ?? baseline!), ...patch }));
		},
		[baseline]
	);

	const configured = readMailConfigured(workerConfig);
	const effectiveStatus =
		mailSettings?.effectiveStatus ?? workerConfig?.mail.effectiveStatus ?? undefined;
	const loading = configLoading || settingsLoading;
	const dirty = baseline != null && draft != null && isAdminMailSettingsFormDirty(draft, baseline);
	const submittable = effectiveDraft != null && isAdminMailSettingsFormSubmittable(effectiveDraft);
	const saveDisabled =
		loading || settingsError || !dirty || !submittable || updateSettings.isPending;

	const localeError = effectiveDraft
		? validateAdminMailDefaultLocale(effectiveDraft.defaultLocale)
		: null;
	const pathTemplateError = effectiveDraft
		? validateAdminMailRegistrationPathTemplate(effectiveDraft.completeRegistrationPathTemplate)
		: null;
	const workerUrlError = effectiveDraft
		? validateAdminMailWorkerGrpcUrl(effectiveDraft.workerGrpcUrl, effectiveDraft.enabled)
		: null;
	const smtpError = effectiveDraft
		? validateAdminMailSmtpFields(effectiveDraft, effectiveDraft.enabled)
		: null;

	const runSaveWithConfirms = useCallback(async () => {
		if (!effectiveDraft || !baseline || draft == null) return;

		if (adminMailSaveNeedsDisableConfirm(baseline, effectiveDraft)) {
			const confirmed = await confirm({
				message: t('pages.settings.infra.mail.config.confirm.disable.message'),
				cancelLabel: t('pages.settings.aiSystem.confirm.cancel'),
				confirmLabel: t('pages.settings.infra.mail.config.confirm.disable.confirm'),
				confirmVariant: 'danger',
			});
			if (!confirmed) return;
		}

		if (adminMailSaveNeedsWorkerUrlConfirm(baseline, effectiveDraft)) {
			const confirmed = await confirm({
				message: t('pages.settings.infra.mail.config.confirm.workerUrl.message'),
				cancelLabel: t('pages.settings.aiSystem.confirm.cancel'),
				confirmLabel: t('pages.settings.infra.mail.config.confirm.workerUrl.confirm'),
			});
			if (!confirmed) return;
		}

		if (adminMailSaveNeedsSmtpHostConfirm(baseline, effectiveDraft)) {
			const confirmed = await confirm({
				message: t('pages.settings.infra.mail.config.confirm.smtpHost.message'),
				cancelLabel: t('pages.settings.aiSystem.confirm.cancel'),
				confirmLabel: t('pages.settings.infra.mail.config.confirm.smtpHost.confirm'),
			});
			if (!confirmed) return;
		}

		try {
			await updateSettings.mutateAsync(buildUpdateAdminMailSettingsRequest(effectiveDraft));
			setDraft(null);
			toast.success(t('pages.settings.infra.mail.config.saveSuccess'));
		} catch {
			toast.error(t('pages.settings.infra.mail.config.saveError'));
		}
	}, [baseline, confirm, draft, effectiveDraft, t, updateSettings]);

	const onTestSmtp = useCallback(async () => {
		if (dirty) {
			toast.info(t('pages.settings.infra.mail.config.testSmtp.saveFirstHint'));
			return;
		}
		try {
			const result = await testSmtp.mutateAsync();
			if (result.smtpReachable) {
				toast.success(result.message ?? t('pages.settings.infra.mail.config.testSmtp.success'));
			} else {
				toast.error(result.message ?? t('pages.settings.infra.mail.config.testSmtp.failure'));
			}
		} catch {
			toast.error(t('pages.settings.infra.mail.config.testSmtp.failure'));
		}
	}, [dirty, t, testSmtp]);

	const workerAuthPlaceholder = useMemo(() => {
		if (effectiveDraft?.clearWorkerAuthToken) return '';
		if (mailSettings?.hasWorkerAuthToken) {
			return t('pages.settings.infra.mail.config.workerAuthToken.placeholderSet');
		}
		return t('pages.settings.infra.mail.config.workerAuthToken.placeholderEmpty');
	}, [effectiveDraft?.clearWorkerAuthToken, mailSettings?.hasWorkerAuthToken, t]);

	const smtpPasswordPlaceholder = useMemo(() => {
		if (effectiveDraft?.clearSmtpPassword) return '';
		if (mailSettings?.smtp.hasPassword) {
			return t('pages.settings.infra.mail.config.smtpPassword.placeholderSet');
		}
		return t('pages.settings.infra.mail.config.smtpPassword.placeholderEmpty');
	}, [effectiveDraft?.clearSmtpPassword, mailSettings?.smtp.hasPassword, t]);

	return (
		<div id="settings-infra-mail" className="settings-page__subsection settings-page__infra-panel">
			<h3 className="settings-page__subsection-title">{t('pages.settings.infra.mail.title')}</h3>
			<p className="settings-page__subsection-desc">{t('pages.settings.infra.mail.description')}</p>
			<p className="settings-page__field-hint">{t('pages.settings.infra.mail.hint')}</p>
			<InfraDevQuickLinks
				links={[
					{
						href: adminInfraDevLinks.mailpitUi,
						labelKey: 'pages.settings.infra.links.mailpit',
						external: true,
					},
					{
						href: adminInfraDevLinks.mailerGuide,
						labelKey: 'pages.settings.infra.links.mailerGuide',
					},
				]}
			/>

			{!loading && effectiveStatus != null && (
				<InfraStatusStrip
					configured={configured}
					effectiveStatus={effectiveStatus}
					lastTest={lastTest}
					updatedAtUtc={mailSettings?.updatedAtUtc}
				/>
			)}

			{settingsLoading ? (
				<p className="settings-page__field-hint">{t('common.loading')}</p>
			) : settingsError ? (
				<p className="settings-page__field-hint settings-page__field-hint--error">
					{t('pages.settings.infra.mail.config.loadError')}
				</p>
			) : effectiveDraft ? (
				<div className="settings-page__mail-config">
					<div className="settings-page__mail-config-section">
						<h4 className="settings-page__mail-config-heading">
							{t('pages.settings.infra.mail.config.platform.sectionTitle')}
						</h4>

						<div className="settings-page__mail-config-row">
							<FormField
								label={t('pages.settings.infra.mail.config.enabled.label')}
								htmlFor="mail-config-enabled"
							>
								<button
									id="mail-config-enabled"
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
								{t('pages.settings.infra.mail.config.enabled.hint')}
							</p>
						</div>

						<div className="settings-page__mail-config-grid">
							<FormField
								label={t('pages.settings.infra.mail.config.defaultLocale.label')}
								htmlFor="mail-config-locale"
								error={localeError ? t(validationMessageKey(localeError)!) : undefined}
								required
							>
								<select
									id="mail-config-locale"
									className="radix-input settings-page__mail-config-select"
									value={effectiveDraft.defaultLocale}
									disabled={updateSettings.isPending}
									onChange={(e) => patchDraft({ defaultLocale: e.target.value })}
								>
									{ADMIN_MAIL_SUPPORTED_LOCALES.map((locale) => (
										<option key={locale} value={locale}>
											{locale}
										</option>
									))}
								</select>
							</FormField>

							<FormField
								label={t('pages.settings.infra.mail.config.workerGrpcUrl.label')}
								htmlFor="mail-config-worker-url"
								error={workerUrlError ? t(validationMessageKey(workerUrlError)!) : undefined}
								required={effectiveDraft.enabled}
							>
								<Input
									id="mail-config-worker-url"
									value={effectiveDraft.workerGrpcUrl}
									disabled={updateSettings.isPending}
									onChange={(e) => patchDraft({ workerGrpcUrl: e.target.value })}
								/>
							</FormField>

							<FormField
								label={t('pages.settings.infra.mail.config.workerAuthToken.label')}
								htmlFor="mail-config-worker-token"
							>
								<div className="settings-page__mail-config-secret-row">
									<Input
										id="mail-config-worker-token"
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
									{mailSettings?.hasWorkerAuthToken && !effectiveDraft.clearWorkerAuthToken && (
										<Button
											type="button"
											variant="outline"
											disabled={updateSettings.isPending}
											onClick={() =>
												patchDraft({ workerAuthToken: '', clearWorkerAuthToken: true })
											}
										>
											{t('pages.settings.infra.mail.config.clearSecret')}
										</Button>
									)}
								</div>
							</FormField>

							<FormField
								label={t('pages.settings.infra.mail.config.portalPublicBaseUrl.label')}
								htmlFor="mail-config-portal-url"
							>
								<Input
									id="mail-config-portal-url"
									value={effectiveDraft.portalPublicBaseUrl}
									disabled={updateSettings.isPending}
									onChange={(e) => patchDraft({ portalPublicBaseUrl: e.target.value })}
								/>
							</FormField>

							<FormField
								label={t('pages.settings.infra.mail.config.completeRegistrationPathTemplate.label')}
								htmlFor="mail-config-path-template"
								error={pathTemplateError ? t(validationMessageKey(pathTemplateError)!) : undefined}
								required
							>
								<Input
									id="mail-config-path-template"
									value={effectiveDraft.completeRegistrationPathTemplate}
									disabled={updateSettings.isPending}
									onChange={(e) => patchDraft({ completeRegistrationPathTemplate: e.target.value })}
								/>
							</FormField>

							<FormField
								label={t('pages.settings.infra.mail.config.mobileDeepLinkBase.label')}
								htmlFor="mail-config-mobile-deeplink"
							>
								<Input
									id="mail-config-mobile-deeplink"
									value={effectiveDraft.mobileDeepLinkBase}
									disabled={updateSettings.isPending}
									onChange={(e) => patchDraft({ mobileDeepLinkBase: e.target.value })}
								/>
							</FormField>

							<label className="settings-page__mail-config-checkbox">
								<input
									type="checkbox"
									checked={effectiveDraft.preferMobileDeepLinkWhenPlatformMobile}
									disabled={updateSettings.isPending}
									onChange={(e) =>
										patchDraft({
											preferMobileDeepLinkWhenPlatformMobile: e.target.checked,
										})
									}
								/>
								<span>
									{t(
										'pages.settings.infra.mail.config.preferMobileDeepLinkWhenPlatformMobile.label'
									)}
								</span>
							</label>
						</div>
					</div>

					<div className="settings-page__mail-config-section">
						<h4 className="settings-page__mail-config-heading">
							{t('pages.settings.infra.mail.config.smtp.sectionTitle')}
						</h4>

						<div className="settings-page__mail-config-grid">
							<FormField
								label={t('pages.settings.infra.mail.config.smtpHost.label')}
								htmlFor="mail-config-smtp-host"
								error={
									smtpError === 'hostRequired' ? t(validationMessageKey(smtpError)!) : undefined
								}
								required={effectiveDraft.enabled}
							>
								<Input
									id="mail-config-smtp-host"
									value={effectiveDraft.smtpHost}
									disabled={updateSettings.isPending}
									onChange={(e) => patchDraft({ smtpHost: e.target.value })}
								/>
							</FormField>

							<FormField
								label={t('pages.settings.infra.mail.config.smtpPort.label')}
								htmlFor="mail-config-smtp-port"
								error={
									smtpError === 'portInvalid' ? t(validationMessageKey(smtpError)!) : undefined
								}
								required={effectiveDraft.enabled}
							>
								<Input
									id="mail-config-smtp-port"
									inputMode="numeric"
									value={effectiveDraft.smtpPort}
									disabled={updateSettings.isPending}
									onChange={(e) => {
										if (e.target.value === '' || /^\d+$/.test(e.target.value)) {
											patchDraft({ smtpPort: e.target.value });
										}
									}}
								/>
							</FormField>

							<label className="settings-page__mail-config-checkbox">
								<input
									type="checkbox"
									checked={effectiveDraft.smtpStartTls}
									disabled={updateSettings.isPending}
									onChange={(e) => patchDraft({ smtpStartTls: e.target.checked })}
								/>
								<span>{t('pages.settings.infra.mail.config.smtpStartTls.label')}</span>
							</label>

							<FormField
								label={t('pages.settings.infra.mail.config.smtpUser.label')}
								htmlFor="mail-config-smtp-user"
							>
								<Input
									id="mail-config-smtp-user"
									value={effectiveDraft.smtpUser}
									disabled={updateSettings.isPending}
									onChange={(e) => patchDraft({ smtpUser: e.target.value })}
								/>
							</FormField>

							<FormField
								label={t('pages.settings.infra.mail.config.smtpPassword.label')}
								htmlFor="mail-config-smtp-password"
							>
								<div className="settings-page__mail-config-secret-row">
									<Input
										id="mail-config-smtp-password"
										type="password"
										autoComplete="new-password"
										value={effectiveDraft.smtpPassword}
										placeholder={smtpPasswordPlaceholder}
										disabled={updateSettings.isPending || effectiveDraft.clearSmtpPassword}
										onChange={(e) =>
											patchDraft({ smtpPassword: e.target.value, clearSmtpPassword: false })
										}
									/>
									{mailSettings?.smtp.hasPassword && !effectiveDraft.clearSmtpPassword && (
										<Button
											type="button"
											variant="outline"
											disabled={updateSettings.isPending}
											onClick={() => patchDraft({ smtpPassword: '', clearSmtpPassword: true })}
										>
											{t('pages.settings.infra.mail.config.clearSecret')}
										</Button>
									)}
								</div>
							</FormField>

							<FormField
								label={t('pages.settings.infra.mail.config.fromEmail.label')}
								htmlFor="mail-config-from-email"
								error={
									smtpError === 'fromEmailRequired' || smtpError === 'fromEmailInvalid'
										? t(validationMessageKey(smtpError)!)
										: undefined
								}
								required={effectiveDraft.enabled}
							>
								<Input
									id="mail-config-from-email"
									type="email"
									value={effectiveDraft.fromEmail}
									disabled={updateSettings.isPending}
									onChange={(e) => patchDraft({ fromEmail: e.target.value })}
								/>
							</FormField>

							<FormField
								label={t('pages.settings.infra.mail.config.fromDisplayName.label')}
								htmlFor="mail-config-from-name"
							>
								<Input
									id="mail-config-from-name"
									value={effectiveDraft.fromDisplayName}
									disabled={updateSettings.isPending}
									onChange={(e) => patchDraft({ fromDisplayName: e.target.value })}
								/>
							</FormField>
						</div>
					</div>

					<div className="settings-page__mail-config-actions">
						<Button
							type="button"
							disabled={saveDisabled}
							onClick={() => void runSaveWithConfirms()}
						>
							{updateSettings.isPending
								? t('common.loading')
								: t('pages.settings.infra.mail.config.save')}
						</Button>
						<Button
							type="button"
							variant="secondary"
							disabled={testSmtp.isPending || loading || settingsError}
							onClick={() => void onTestSmtp()}
						>
							{testSmtp.isPending
								? t('common.loading')
								: t('pages.settings.infra.mail.config.testSmtp.action')}
						</Button>
					</div>
				</div>
			) : null}

			<div className="settings-page__mail-config-smoke">
				<h4 className="settings-page__mail-config-heading">
					{t('pages.settings.infra.mail.config.smoke.sectionTitle')}
				</h4>
				<p className="settings-page__field-hint">
					{t('pages.settings.infra.mail.config.smoke.hint')}
				</p>
				<Button
					type="button"
					variant="secondary"
					disabled={mailerTest.isPending || loading}
					onClick={() => void runTest()}
				>
					{mailerTest.isPending ? t('common.loading') : t('pages.settings.infra.mail.send')}
				</Button>
				{lastResult && (
					<dl className="settings-page__infra-result">
						<div>
							<dt>{t('pages.settings.infra.result.correlationId')}</dt>
							<dd>{lastResult.correlationId}</dd>
						</div>
						{lastResult.smtpMessageId && (
							<div>
								<dt>{t('pages.settings.infra.result.smtpMessageId')}</dt>
								<dd>{lastResult.smtpMessageId}</dd>
							</div>
						)}
					</dl>
				)}
			</div>

			{ConfirmModalHost}
		</div>
	);
}
