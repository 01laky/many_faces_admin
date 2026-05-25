// @vitest-environment happy-dom
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { AdminPushSettingsDto } from '@/api/models/AdminPushSettingsDto';

const confirmMock = vi.fn();
const mutateAsyncMock = vi.fn();
const updateMutateAsyncMock = vi.fn();
const testFcmMutateAsyncMock = vi.fn();

const sampleSettings: AdminPushSettingsDto = {
	enabled: true,
	workerGrpcUrl: 'http://push:50051',
	hasWorkerAuthToken: false,
	firebase: { projectId: 'demo-project', hasCredentials: true },
	defaults: {
		titleLocKey: 'push.title',
		bodyLocKey: 'push.body',
		androidChannelId: 'default',
	},
	grpcDeadlineSeconds: 15,
	transport: { tlsConfiguredViaEnv: false, mtlsConfiguredViaEnv: false },
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
	usePushTestSelf: () => ({
		mutateAsync: mutateAsyncMock,
		isPending: false,
	}),
}));

vi.mock('@/hooks/api/useAdminPushSettingsApi', () => ({
	useAdminPushSettings: () => ({
		data: sampleSettings,
		isLoading: false,
		isError: false,
	}),
	useUpdateAdminPushSettings: () => ({
		mutateAsync: updateMutateAsyncMock,
		isPending: false,
	}),
	useTestAdminPushFcm: () => ({
		mutateAsync: testFcmMutateAsyncMock,
		isPending: false,
	}),
}));

import { PushConfigPanel } from './PushConfigPanel';
import { resolvePushEffectiveStatusBadge } from '@/utils/adminPushEffectiveStatus';

describe('APC-U1 renders platform and Firebase sections', () => {
	it('shows platform and Firebase section headings when settings load', () => {
		render(
			<PushConfigPanel
				workerConfig={{
					mail: { configured: true, effectiveStatus: 'configured' },
					push: { configured: true, effectiveStatus: 'configured', registeredDeviceCount: 0 },
				}}
			/>
		);

		expect(
			screen.getByRole('heading', {
				name: 'pages.settings.infra.push.config.platform.sectionTitle',
			})
		).toBeInTheDocument();
		expect(
			screen.getByRole('heading', {
				name: 'pages.settings.infra.push.config.firebase.sectionTitle',
			})
		).toBeInTheDocument();
	});
});

describe('APC-U5 effectiveStatus badge mapping', () => {
	it('maps backend statuses to badge keys', () => {
		expect(resolvePushEffectiveStatusBadge('disabled')).toBe('disabled');
		expect(resolvePushEffectiveStatusBadge('incomplete')).toBe('incomplete');
		expect(resolvePushEffectiveStatusBadge('configured')).toBe('configured');
		expect(resolvePushEffectiveStatusBadge(undefined, false)).toBe('notConfigured');
	});
});

describe('APC-U3 disable confirm on save', () => {
	beforeEach(() => {
		confirmMock.mockReset();
		updateMutateAsyncMock.mockReset();
		updateMutateAsyncMock.mockResolvedValue({ ...sampleSettings, enabled: false });
	});

	it('shows disable confirm when saving with push turned off', async () => {
		confirmMock.mockResolvedValueOnce(false);

		render(
			<PushConfigPanel
				workerConfig={{
					mail: { configured: true, effectiveStatus: 'configured' },
					push: { configured: true, effectiveStatus: 'configured', registeredDeviceCount: 0 },
				}}
			/>
		);

		fireEvent.click(screen.getByRole('switch'));
		fireEvent.click(screen.getByRole('button', { name: 'pages.settings.infra.push.config.save' }));

		await waitFor(() => expect(confirmMock).toHaveBeenCalled());
		expect(updateMutateAsyncMock).not.toHaveBeenCalled();
	});
});

describe('APC-U4 worker URL change confirm on save', () => {
	beforeEach(() => {
		confirmMock.mockReset();
		updateMutateAsyncMock.mockReset();
		updateMutateAsyncMock.mockResolvedValue(sampleSettings);
	});

	it('shows worker URL confirm before PUT', async () => {
		confirmMock.mockResolvedValueOnce(true);

		render(
			<PushConfigPanel
				workerConfig={{
					mail: { configured: true, effectiveStatus: 'configured' },
					push: { configured: true, effectiveStatus: 'configured', registeredDeviceCount: 0 },
				}}
			/>
		);

		fireEvent.change(document.getElementById('push-config-worker-url')!, {
			target: { value: 'http://push-new:50051' },
		});
		fireEvent.click(screen.getByRole('button', { name: 'pages.settings.infra.push.config.save' }));

		await waitFor(() => expect(confirmMock).toHaveBeenCalled());
		expect(updateMutateAsyncMock).toHaveBeenCalled();
	});
});

describe('APC-U6 smoke test still calls test-self', () => {
	beforeEach(() => {
		confirmMock.mockReset();
		mutateAsyncMock.mockReset();
		mutateAsyncMock.mockResolvedValue({ sent: 1, failed: 0, prunedInvalidTokens: 0 });
	});

	it('POSTs test-self from smoke section', async () => {
		confirmMock.mockImplementation(async (opts: { confirmAction?: () => Promise<void> }) => {
			await opts.confirmAction?.();
			return true;
		});

		render(
			<PushConfigPanel
				workerConfig={{
					mail: { configured: true, effectiveStatus: 'configured' },
					push: { configured: true, effectiveStatus: 'configured', registeredDeviceCount: 0 },
				}}
			/>
		);

		fireEvent.click(screen.getByRole('button', { name: 'pages.settings.infra.push.send' }));
		await waitFor(() => expect(mutateAsyncMock).toHaveBeenCalled());
	});
});

describe('APC-U2 save disabled for invalid worker URL', () => {
	it('keeps save disabled when worker URL is invalid', () => {
		render(
			<PushConfigPanel
				workerConfig={{
					mail: { configured: false, effectiveStatus: 'incomplete' },
					push: { configured: false, effectiveStatus: 'incomplete', registeredDeviceCount: 0 },
				}}
			/>
		);

		fireEvent.change(document.getElementById('push-config-worker-url')!, {
			target: { value: 'bad-url' },
		});

		expect(
			screen.getByRole('button', { name: 'pages.settings.infra.push.config.save' })
		).toBeDisabled();
	});
});

describe('APC-U7 JSON file upload populates draft', () => {
	it('reads uploaded JSON into the service account field', async () => {
		render(
			<PushConfigPanel
				workerConfig={{
					mail: { configured: true, effectiveStatus: 'configured' },
					push: { configured: true, effectiveStatus: 'configured', registeredDeviceCount: 0 },
				}}
			/>
		);

		const jsonInput = document.querySelector('input[type="file"]') as HTMLInputElement;
		const json = '{"type":"service_account","project_id":"demo"}';
		const file = new File([json], 'sa.json', { type: 'application/json' });

		fireEvent.change(jsonInput, { target: { files: [file] } });

		await waitFor(() => {
			expect((document.getElementById('push-config-firebase-json') as HTMLInputElement).value).toBe(
				json
			);
		});
	});
});

describe('APC-U8 test-fcm disabled when form dirty', () => {
	it('disables test FCM button while draft is dirty', () => {
		render(
			<PushConfigPanel
				workerConfig={{
					mail: { configured: true, effectiveStatus: 'configured' },
					push: { configured: true, effectiveStatus: 'configured', registeredDeviceCount: 0 },
				}}
			/>
		);

		fireEvent.change(document.getElementById('push-config-worker-url')!, {
			target: { value: 'http://push-new:50051' },
		});

		expect(
			screen.getByRole('button', { name: 'pages.settings.infra.push.config.testFcm.action' })
		).toBeDisabled();
	});
});
