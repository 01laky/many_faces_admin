import { useCallback, useRef, useState } from 'react';
import { ConfirmModal, type ConfirmModalProps } from '@/components/ConfirmModal';

export type ConfirmModalOptions = Pick<
	ConfirmModalProps,
	'title' | 'message' | 'confirmLabel' | 'cancelLabel' | 'confirmVariant' | 'confirmDisabled'
> & {
	/**
	 * When set, Confirm waits for this promise (disables Confirm while pending) before closing successfully.
	 * Typical for long Activate AI PUT; errors should be handled inside the promise (toast, etc.).
	 */
	confirmAction?: () => Promise<void>;
};

/** Promise-based confirm dialog — render `ConfirmModalHost` once near the app root. */
export function useConfirmModal() {
	const [open, setOpen] = useState(false);
	const [options, setOptions] = useState<ConfirmModalOptions | null>(null);
	const [confirmBusy, setConfirmBusy] = useState(false);
	const resolveRef = useRef<((confirmed: boolean) => void) | null>(null);

	const confirm = useCallback((opts: ConfirmModalOptions) => {
		return new Promise<boolean>((resolve) => {
			resolveRef.current = resolve;
			setConfirmBusy(false);
			setOptions(opts);
			setOpen(true);
		});
	}, []);

	const finish = useCallback((confirmed: boolean) => {
		setOpen(false);
		setConfirmBusy(false);
		resolveRef.current?.(confirmed);
		resolveRef.current = null;
	}, []);

	const onConfirm = useCallback(async () => {
		if (!options?.confirmAction) {
			finish(true);
			return;
		}
		setConfirmBusy(true);
		try {
			await options.confirmAction();
			finish(true);
		} catch {
			finish(true);
		} finally {
			setConfirmBusy(false);
		}
	}, [options, finish]);

	const ConfirmModalHost =
		options != null ? (
			<ConfirmModal
				show={open}
				title={options.title}
				message={options.message}
				confirmLabel={options.confirmLabel}
				cancelLabel={options.cancelLabel}
				confirmVariant={options.confirmVariant}
				confirmDisabled={confirmBusy || Boolean(options.confirmDisabled)}
				onConfirm={() => void onConfirm()}
				onCancel={() => {
					if (confirmBusy) return;
					finish(false);
				}}
			/>
		) : null;

	return { confirm, ConfirmModalHost };
}
