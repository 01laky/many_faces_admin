export interface AlbumDeleteReasonDialogProps {
	show: boolean;
	title: string;
	onCancel: () => void;
	onConfirm: (reason: string, userMessage: string) => void | Promise<void>;
	isSubmitting?: boolean;
	/** When false, only reason is required (approve override). */
	requireUserMessage?: boolean;
}
