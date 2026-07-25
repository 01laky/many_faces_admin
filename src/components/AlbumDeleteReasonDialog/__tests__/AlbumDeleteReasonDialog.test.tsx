// @vitest-environment happy-dom
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AlbumDeleteReasonDialog } from '../AlbumDeleteReasonDialog';

/**
 * Shared operator reason/user-message dialog used by album, reel, story and face-profile detail pages.
 *
 * Covers:
 *  - ADM-U5  (album prompt §9.1)  — Confirm disabled until both fields valid
 *  - RDM-U10 (reel prompt §10.1)  — same gate for the reject / delete-reel dialogs, plus the
 *                                   approve-override variant that only requires a reason
 *  - ADPM-U10 (face-profile §9.1) — reason/user-message validation behind the delete-comment /
 *                                   delete-review dialogs
 *
 * react-i18next is globally mocked in src/test/setup.ts, so labels render as raw translation keys.
 */

/** Confirm button — labelled with the raw `common.ok` key under the global i18n mock. */
function confirmButton(): HTMLElement {
	return screen.getByRole('button', { name: 'common.ok' });
}

describe('AlbumDeleteReasonDialog', () => {
	it('ADM-U5 / ADPM-U10: Confirm stays disabled until reason and user message are both valid', () => {
		const onConfirm = vi.fn();
		render(
			<AlbumDeleteReasonDialog show title="Delete album" onCancel={vi.fn()} onConfirm={onConfirm} />
		);

		const [reasonBox, userMessageBox] = screen.getAllByRole('textbox');

		// Nothing typed yet — both fields are empty, so the destructive action must stay locked.
		expect(confirmButton()).toBeDisabled();

		// Fill the creator-facing message first: that switches off the reason→message auto-sync,
		// so the two fields are then validated independently (which is what this case is about).
		fireEvent.change(userMessageBox, {
			target: { value: 'Please review the community rules before reposting.' },
		});
		expect(confirmButton()).toBeDisabled();

		// A reason shorter than the 10-character minimum keeps Confirm disabled.
		fireEvent.change(reasonBox, { target: { value: 'Short' } });
		expect(confirmButton()).toBeDisabled();

		// Both fields valid — Confirm unlocks and forwards the trimmed values.
		fireEvent.change(reasonBox, { target: { value: '  Violates the community rules  ' } });
		expect(confirmButton()).toBeEnabled();

		fireEvent.click(confirmButton());
		expect(onConfirm).toHaveBeenCalledWith(
			'Violates the community rules',
			'Please review the community rules before reposting.'
		);
	});

	it('ADM-U5: an over-long reason (2001 chars) re-locks Confirm', () => {
		render(
			<AlbumDeleteReasonDialog show title="Delete album" onCancel={vi.fn()} onConfirm={vi.fn()} />
		);

		const [reasonBox, userMessageBox] = screen.getAllByRole('textbox');
		fireEvent.change(userMessageBox, { target: { value: 'A perfectly valid creator message.' } });
		fireEvent.change(reasonBox, { target: { value: 'Violates the community rules' } });
		expect(confirmButton()).toBeEnabled();

		fireEvent.change(reasonBox, { target: { value: 'x'.repeat(2001) } });
		expect(confirmButton()).toBeDisabled();
	});

	it('RDM-U10: approve-override variant (requireUserMessage=false) unlocks on a valid reason alone', () => {
		const onConfirm = vi.fn();
		render(
			<AlbumDeleteReasonDialog
				show
				title="Approve"
				requireUserMessage={false}
				onCancel={vi.fn()}
				onConfirm={onConfirm}
			/>
		);

		// Only the reason textarea is rendered — no creator-facing message, no copy-reason checkbox.
		expect(screen.getAllByRole('textbox')).toHaveLength(1);
		expect(screen.queryByRole('checkbox')).toBeNull();
		expect(confirmButton()).toBeDisabled();

		fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: 'Too short' } });
		expect(confirmButton()).toBeDisabled();

		fireEvent.change(screen.getAllByRole('textbox')[0], {
			target: { value: 'AI recommended reject but the clip is fine' },
		});
		expect(confirmButton()).toBeEnabled();

		// The hidden user-message state still mirrors the reason (auto-sync stays on while the field
		// is not rendered), which is what ReelDetailPage's `userMessage || reason` fallback expects.
		fireEvent.click(confirmButton());
		expect(onConfirm).toHaveBeenCalledWith(
			'AI recommended reject but the clip is fine',
			'AI recommended reject but the clip is fine'
		);
	});

	it('ADM-U5: submitting state disables both Confirm and Cancel', () => {
		render(
			<AlbumDeleteReasonDialog
				show
				title="Delete album"
				isSubmitting
				onCancel={vi.fn()}
				onConfirm={vi.fn()}
			/>
		);

		expect(confirmButton()).toBeDisabled();
		expect(screen.getByRole('button', { name: 'common.cancel' })).toBeDisabled();
	});

	it('renders nothing while closed', () => {
		render(
			<AlbumDeleteReasonDialog
				show={false}
				title="Delete album"
				onCancel={vi.fn()}
				onConfirm={vi.fn()}
			/>
		);

		expect(screen.queryByRole('button', { name: 'common.ok' })).toBeNull();
	});
});
