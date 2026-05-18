import { useCallback, useRef, useState } from 'react';
import { ConfirmModal, type ConfirmModalProps } from '@/components/ConfirmModal';

export type ConfirmModalOptions = Pick<
	ConfirmModalProps,
	'title' | 'message' | 'confirmLabel' | 'cancelLabel' | 'confirmVariant' | 'confirmDisabled'
>;

/** Promise-based confirm dialog — render `ConfirmModalHost` once near the app root. */
export function useConfirmModal() {
	const [open, setOpen] = useState(false);
	const [options, setOptions] = useState<ConfirmModalOptions | null>(null);
	const resolveRef = useRef<((confirmed: boolean) => void) | null>(null);

	const confirm = useCallback((opts: ConfirmModalOptions) => {
		return new Promise<boolean>((resolve) => {
			resolveRef.current = resolve;
			setOptions(opts);
			setOpen(true);
		});
	}, []);

	const finish = useCallback((confirmed: boolean) => {
		setOpen(false);
		resolveRef.current?.(confirmed);
		resolveRef.current = null;
	}, []);

	const ConfirmModalHost =
		options != null ? (
			<ConfirmModal
				show={open}
				title={options.title}
				message={options.message}
				confirmLabel={options.confirmLabel}
				cancelLabel={options.cancelLabel}
				confirmVariant={options.confirmVariant}
				confirmDisabled={options.confirmDisabled}
				onConfirm={() => finish(true)}
				onCancel={() => finish(false)}
			/>
		) : null;

	return { confirm, ConfirmModalHost };
}
