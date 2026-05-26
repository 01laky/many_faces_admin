import { useTranslation } from 'react-i18next';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import './ConfirmModal.scss';
import type { ConfirmModalProps } from './types';

export function ConfirmModal({
	show,
	title,
	message,
	confirmLabel,
	cancelLabel,
	confirmVariant = 'primary',
	confirmDisabled = false,
	onConfirm,
	onCancel,
}: ConfirmModalProps) {
	const { t } = useTranslation('common');

	return (
		<Modal
			show={show}
			onHide={onCancel}
			centered
			backdrop="static"
			keyboard
			className="confirm-modal"
		>
			{title ? (
				<Modal.Header closeButton>
					<Modal.Title>{title}</Modal.Title>
				</Modal.Header>
			) : null}
			<Modal.Body>{message}</Modal.Body>
			<Modal.Footer>
				<Button variant="outline-secondary" onClick={onCancel}>
					{cancelLabel ?? t('common.cancel')}
				</Button>
				<Button variant={confirmVariant} onClick={onConfirm} disabled={confirmDisabled}>
					{confirmLabel ?? t('common.ok')}
				</Button>
			</Modal.Footer>
		</Modal>
	);
}
