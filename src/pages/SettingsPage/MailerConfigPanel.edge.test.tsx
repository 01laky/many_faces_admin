// @vitest-environment happy-dom
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { AdminMailSettingsDto } from '@/api/models/AdminMailSettingsDto';

const confirmMock = vi.fn();
const mutateAsyncMock = vi.fn();
const updateMutateAsyncMock = vi.fn();
const testSmtpMutateAsyncMock = vi.fn();

const sampleSettings: AdminMailSettingsDto = {
	enabled: true,
	defaultLocale: 'en',
	workerGrpcUrl: 'http://mailer:50051',
	hasWorkerAuthToken: false,
	smtp: { host: 'mailpit', port: 1025, startTls: false, user: '', hasPassword: false },
	from: { email: 'noreply@example.com', displayName: 'Demo' },
	registrationLinks: {
		portalPublicBaseUrl: 'https://portal.example',
		completeRegistrationPathTemplate: '/{locale}/register',
		mobileDeepLinkBase: 'manyfaces://',
		preferMobileDeepLinkWhenPlatformMobile: false,
	},
	effectiveStatus: 'configured',
	updatedAtUtc: '2026-05-25T12:00:00Z',
};

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
}));

vi.mock('react-toastify', () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
		info: vi.fn(),
	},
}));

vi.mock('@/hooks/useConfirmModal', () => ({
	useConfirmModal: () => ({
		confirm: confirmMock,
		ConfirmModalHost: null,
	}),
}));

vi.mock('@/hooks/api/useAdminInfraApi', () => ({
	useMailerTestSelf: () => ({
		mutateAsync: mutateAsyncMock,
		isPending: false,
	}),
}));

vi.mock('@/hooks/api/useAdminMailSettingsApi', () => ({
	useAdminMailSettings: () => ({
		data: sampleSettings,
		isLoading: false,
		isError: false,
	}),
	useUpdateAdminMailSettings: () => ({
		mutateAsync: updateMutateAsyncMock,
		isPending: false,
	}),
	useTestAdminMailSmtp: () => ({
		mutateAsync: testSmtpMutateAsyncMock,
		isPending: false,
	}),
}));

import { MailerConfigPanel } from './MailerConfigPanel';
import { resolveMailEffectiveStatusBadge } from '@/utils/adminMailEffectiveStatus';

describe('AMC-U5 effectiveStatus badge mapping', () => {
	it('maps backend statuses to badge keys', () => {
		expect(resolveMailEffectiveStatusBadge('disabled')).toBe('disabled');
		expect(resolveMailEffectiveStatusBadge('incomplete')).toBe('incomplete');
		expect(resolveMailEffectiveStatusBadge('configured')).toBe('configured');
		expect(resolveMailEffectiveStatusBadge(undefined, false)).toBe('notConfigured');
	});
});

describe('AMC-U4 disable confirm on save', () => {
	beforeEach(() => {
		confirmMock.mockReset();
		updateMutateAsyncMock.mockReset();
		updateMutateAsyncMock.mockResolvedValue({ ...sampleSettings, enabled: false });
	});

	it('shows disable confirm when saving with mail turned off', async () => {
		confirmMock.mockResolvedValueOnce(false);

		render(
			<MailerConfigPanel
				workerConfig={{
					mail: { configured: true, effectiveStatus: 'configured' },
					push: { configured: true, registeredDeviceCount: 0 },
				}}
			/>
		);

		fireEvent.click(screen.getByRole('switch'));
		fireEvent.click(screen.getByRole('button', { name: 'pages.settings.infra.mail.config.save' }));

		await waitFor(() => expect(confirmMock).toHaveBeenCalled());
		expect(updateMutateAsyncMock).not.toHaveBeenCalled();
	});
});

describe('AMC-U8 SMTP host change confirm on save', () => {
	beforeEach(() => {
		confirmMock.mockReset();
		updateMutateAsyncMock.mockReset();
		updateMutateAsyncMock.mockResolvedValue(sampleSettings);
	});

	it('shows SMTP host confirm before PUT', async () => {
		confirmMock.mockResolvedValueOnce(true);

		render(
			<MailerConfigPanel
				workerConfig={{
					mail: { configured: true, effectiveStatus: 'configured' },
					push: { configured: true, registeredDeviceCount: 0 },
				}}
			/>
		);

		fireEvent.change(document.getElementById('mail-config-smtp-host')!, {
			target: { value: 'smtp-new' },
		});
		fireEvent.click(screen.getByRole('button', { name: 'pages.settings.infra.mail.config.save' }));

		await waitFor(() => expect(confirmMock).toHaveBeenCalled());
		expect(updateMutateAsyncMock).toHaveBeenCalled();
	});
});

describe('AMC-U6 smoke test still calls test-self', () => {
	beforeEach(() => {
		confirmMock.mockReset();
		mutateAsyncMock.mockReset();
		mutateAsyncMock.mockResolvedValue({ correlationId: 'cid-1' });
	});

	it('POSTs test-self from smoke section', async () => {
		confirmMock.mockImplementation(async (opts: { confirmAction?: () => Promise<void> }) => {
			await opts.confirmAction?.();
			return true;
		});

		render(
			<MailerConfigPanel
				workerConfig={{
					mail: { configured: true, effectiveStatus: 'configured' },
					push: { configured: true, registeredDeviceCount: 0 },
				}}
			/>
		);

		fireEvent.click(screen.getByRole('button', { name: 'pages.settings.infra.mail.send' }));
		await waitFor(() => expect(mutateAsyncMock).toHaveBeenCalled());
	});
});

describe('AMC-U3 save disabled for invalid worker URL', () => {
	it('keeps save disabled when worker URL is invalid', () => {
		render(
			<MailerConfigPanel
				workerConfig={{
					mail: { configured: false, effectiveStatus: 'incomplete' },
					push: { configured: true, registeredDeviceCount: 0 },
				}}
			/>
		);

		fireEvent.change(document.getElementById('mail-config-worker-url')!, {
			target: { value: 'bad-url' },
		});

		expect(
			screen.getByRole('button', { name: 'pages.settings.infra.mail.config.save' })
		).toBeDisabled();
	});
});
