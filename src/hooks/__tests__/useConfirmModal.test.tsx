// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useConfirmModal } from '../useConfirmModal';

function Harness({
	action,
	onResolved,
}: {
	action: () => Promise<void>;
	onResolved: (confirmed: boolean) => void;
}) {
	const { confirm, ConfirmModalHost } = useConfirmModal();
	return (
		<>
			<button
				type="button"
				onClick={() =>
					void confirm({
						title: 'Title',
						message: 'Message',
						confirmLabel: 'DoIt',
						confirmAction: action,
					}).then(onResolved)
				}
			>
				open
			</button>
			{ConfirmModalHost}
		</>
	);
}

describe('useConfirmModal confirmAction handling', () => {
	it('resolves false when confirmAction rejects (does not report a failed action as confirmed)', async () => {
		const onResolved = vi.fn();
		const action = vi.fn().mockRejectedValue(new Error('boom'));
		render(<Harness action={action} onResolved={onResolved} />);

		fireEvent.click(screen.getByText('open'));
		fireEvent.click(await screen.findByText('DoIt'));

		await waitFor(() => expect(onResolved).toHaveBeenCalledWith(false));
		expect(action).toHaveBeenCalledTimes(1);
	});

	it('resolves true when confirmAction succeeds', async () => {
		const onResolved = vi.fn();
		const action = vi.fn().mockResolvedValue(undefined);
		render(<Harness action={action} onResolved={onResolved} />);

		fireEvent.click(screen.getByText('open'));
		fireEvent.click(await screen.findByText('DoIt'));

		await waitFor(() => expect(onResolved).toHaveBeenCalledWith(true));
	});
});
