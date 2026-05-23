import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import type { TFunction } from 'i18next';
import type { InfraLastTestOutcome } from '@/utils/adminInfraStatusStrip';
import type { useConfirmModal } from './useConfirmModal';

type ConfirmFn = ReturnType<typeof useConfirmModal>['confirm'];

export function useInfraSmokeTest<T>({
	confirm,
	t,
	messageKey,
	cancelLabelKey,
	confirmLabelKey,
	successToastKey,
	mutateAsync,
	getSuccessDetail,
	resolveError,
}: {
	confirm: ConfirmFn;
	t: TFunction;
	messageKey: string;
	cancelLabelKey: string;
	confirmLabelKey: string;
	successToastKey: string;
	mutateAsync: () => Promise<T>;
	getSuccessDetail: (result: T) => string;
	resolveError: (t: TFunction, err: unknown) => string;
}) {
	const [lastTest, setLastTest] = useState<InfraLastTestOutcome>({ kind: 'none' });
	const [lastResult, setLastResult] = useState<T | null>(null);

	const runTest = useCallback(async () => {
		await confirm({
			message: t(messageKey),
			cancelLabel: t(cancelLabelKey),
			confirmLabel: t(confirmLabelKey),
			confirmAction: async () => {
				try {
					const result = await mutateAsync();
					setLastResult(result);
					setLastTest({
						kind: 'success',
						at: new Date(),
						detail: getSuccessDetail(result),
					});
					toast.success(t(successToastKey));
				} catch (err) {
					const message = resolveError(t, err);
					setLastTest({ kind: 'failure', at: new Date(), message });
					toast.error(message);
					throw err;
				}
			},
		});
	}, [
		confirm,
		t,
		messageKey,
		cancelLabelKey,
		confirmLabelKey,
		successToastKey,
		mutateAsync,
		getSuccessDetail,
		resolveError,
	]);

	return { runTest, lastTest, lastResult };
}
