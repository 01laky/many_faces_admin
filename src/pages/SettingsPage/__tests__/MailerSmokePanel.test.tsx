// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const confirmMock = vi.fn();
const mutateAsyncMock = vi.fn();

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
	}),
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

import { MailerSmokePanel } from '../MailerSmokePanel';

describe('MailerSmokePanel confirm cancel', () => {
	it('does not POST when confirm returns false', async () => {
		confirmMock.mockResolvedValueOnce(false);
		mutateAsyncMock.mockClear();

		render(
			<MailerSmokePanel
				workerConfig={{
					mail: { configured: true },
					push: { configured: true, registeredDeviceCount: 0 },
				}}
			/>
		);

		fireEvent.click(screen.getByRole('button', { name: 'pages.settings.infra.mail.send' }));
		await waitFor(() => expect(confirmMock).toHaveBeenCalled());
		expect(mutateAsyncMock).not.toHaveBeenCalled();
	});
});
