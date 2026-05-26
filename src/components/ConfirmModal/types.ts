export interface ConfirmModalProps {
	show: boolean;
	message: string;
	title?: string;
	confirmLabel?: string;
	cancelLabel?: string;
	confirmVariant?: 'primary' | 'danger';
	confirmDisabled?: boolean;
	onConfirm: () => void;
	onCancel: () => void;
}
