import { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/radix/Button';
import {
	validateReasonAndUserMessage,
	validateReasonOnly,
	shouldSyncUserMessageFromReason,
	nextSyncedUserMessage,
} from '@/utils/albumDetailValidation';

export interface AlbumDeleteReasonDialogProps {
	show: boolean;
	title: string;
	onCancel: () => void;
	onConfirm: (reason: string, userMessage: string) => void | Promise<void>;
	isSubmitting?: boolean;
	/** When false, only reason is required (approve override). */
	requireUserMessage?: boolean;
}

export function AlbumDeleteReasonDialog({
	show,
	title,
	onCancel,
	onConfirm,
	isSubmitting = false,
	requireUserMessage = true,
}: AlbumDeleteReasonDialogProps) {
	const { t } = useTranslation('common');
	const [reason, setReason] = useState('');
	const [userMessage, setUserMessage] = useState('');
	const [lastSyncedReason, setLastSyncedReason] = useState('');
	const [copyReason, setCopyReason] = useState(false);

	const pairedValidation = validateReasonAndUserMessage({ reason, userMessage });
	const reasonOnlyValidation = validateReasonOnly(reason);
	const validation = requireUserMessage ? pairedValidation : reasonOnlyValidation;
	const valid = validation.valid;

	if (!show) return null;

	const handleReasonChange = (value: string) => {
		setReason(value);
		if (copyReason || shouldSyncUserMessageFromReason(value, userMessage, lastSyncedReason)) {
			const synced = nextSyncedUserMessage(value);
			setUserMessage(synced);
			setLastSyncedReason(value);
		}
	};

	const handleCopyReasonToggle = (checked: boolean) => {
		setCopyReason(checked);
		if (checked) {
			const synced = nextSyncedUserMessage(reason);
			setUserMessage(synced);
			setLastSyncedReason(reason);
		}
	};

	const fieldError = (key?: string) => {
		if (!key) return undefined;
		if (key === 'required') return t('pages.albumDetail.validationRequired');
		if (key === 'min') return t('pages.albumDetail.validationMin');
		return t('pages.albumDetail.validationMax');
	};

	return (
		<Modal show={show} onHide={onCancel} centered role="dialog" aria-modal="true">
			<Modal.Header closeButton>
				<Modal.Title>{title}</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<Form.Group className="mb-3">
					<Form.Label>{t('pages.albumDetail.reasonLabel')}</Form.Label>
					<Form.Control
						as="textarea"
						rows={3}
						value={reason}
						onChange={(e) => handleReasonChange(e.target.value)}
						isInvalid={Boolean(validation.reasonError)}
					/>
					<Form.Control.Feedback type="invalid">
						{fieldError(validation.reasonError)}
					</Form.Control.Feedback>
				</Form.Group>
				{requireUserMessage && (
					<>
						<Form.Check
							type="checkbox"
							className="mb-3"
							label={t('pages.albumDetail.copyReasonToUserMessage')}
							checked={copyReason}
							onChange={(e) => handleCopyReasonToggle(e.target.checked)}
						/>
						<Form.Group>
							<Form.Label>{t('pages.albumDetail.userMessageLabel')}</Form.Label>
							<Form.Control
								as="textarea"
								rows={3}
								value={userMessage}
								onChange={(e) => setUserMessage(e.target.value)}
								isInvalid={Boolean(
									requireUserMessage && 'userMessageError' in validation
										? validation.userMessageError
										: false
								)}
							/>
							<Form.Control.Feedback type="invalid">
								{fieldError(
									requireUserMessage && 'userMessageError' in validation
										? validation.userMessageError
										: undefined
								)}
							</Form.Control.Feedback>
						</Form.Group>
					</>
				)}
			</Modal.Body>
			<Modal.Footer>
				<Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
					{t('common.cancel')}
				</Button>
				<Button
					variant="danger"
					disabled={!valid || isSubmitting}
					onClick={() => void onConfirm(reason.trim(), userMessage.trim())}
				>
					{t('common.ok')}
				</Button>
			</Modal.Footer>
		</Modal>
	);
}
