import { useEffect, useRef } from 'react';
import Modal from 'react-bootstrap/Modal';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/radix/Button';
import { isVideoMediaItem } from '@/types/contentMedia';
import { getNextIndex, getPrevIndex } from '@/utils/contentMediaModalIndex';
import './ContentMediaPreviewModal.scss';
import type { ContentMediaPreviewModalProps } from './types';

export function ContentMediaPreviewModal({
	show,
	items,
	index,
	onIndexChange,
	onClose,
	onDeleteCurrent,
	showDelete = false,
}: ContentMediaPreviewModalProps) {
	const { t } = useTranslation('common');
	const closeBtnRef = useRef<HTMLButtonElement>(null);
	const item = items[index];
	const count = items.length;

	useEffect(() => {
		if (!show) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
			if (e.key === 'ArrowRight' && count > 1) onIndexChange(getNextIndex(index, count));
			if (e.key === 'ArrowLeft' && count > 1) onIndexChange(getPrevIndex(index, count));
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [show, index, count, onClose, onIndexChange]);

	if (!item) return null;

	const isVideo = isVideoMediaItem(item);

	return (
		<Modal
			show={show}
			onHide={onClose}
			centered
			className="content-media-preview-modal"
			role="dialog"
			aria-modal="true"
			enforceFocus
			restoreFocus
		>
			<Modal.Header closeButton>
				<Modal.Title>
					{item.title ||
						t('pages.albumDetail.previewCounter', { current: index + 1, total: count })}
				</Modal.Title>
			</Modal.Header>
			<Modal.Body className="content-media-preview-modal__body">
				<div className="content-media-preview-modal__viewer" data-testid="preview-viewer">
					{isVideo && item.videoUrl ? (
						<video src={item.videoUrl} controls poster={item.imageUrl} />
					) : (
						<img src={item.imageUrl} alt="" />
					)}
				</div>
				<div className="content-media-preview-modal__nav">
					<Button
						variant="outline"
						disabled={count <= 1}
						onClick={() => onIndexChange(getPrevIndex(index, count))}
					>
						{t('pages.albumDetail.previewPrev')}
					</Button>
					<span>{t('pages.albumDetail.previewCounter', { current: index + 1, total: count })}</span>
					<Button
						variant="outline"
						disabled={count <= 1}
						onClick={() => onIndexChange(getNextIndex(index, count))}
					>
						{t('pages.albumDetail.previewNext')}
					</Button>
				</div>
				{showDelete && onDeleteCurrent && (
					<Button variant="danger" className="mt-2" onClick={onDeleteCurrent}>
						{t('pages.albumDetail.deleteFromPreview')}
					</Button>
				)}
			</Modal.Body>
			<Modal.Footer>
				<Button ref={closeBtnRef} variant="secondary" onClick={onClose}>
					{t('common.cancel')}
				</Button>
			</Modal.Footer>
		</Modal>
	);
}
