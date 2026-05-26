import { useTranslation } from 'react-i18next';
import {
	getModerationQueueLabel,
	getModerationStatusChipTone,
	type AiReviewStatus,
	type ContentApprovalStatus,
} from '@/utils/contentModeration';
import './ModerationStatusChips.scss';
import type { ModerationStatusChipsProps } from './types';

/** Operator-facing moderation status (one summary chip; avoids duplicate raw enum badges). */
export function ModerationStatusChips({
	approvalStatus,
	aiReviewStatus,
}: ModerationStatusChipsProps) {
	const { t } = useTranslation('common');
	const label = getModerationQueueLabel(
		approvalStatus as ContentApprovalStatus | undefined,
		aiReviewStatus as AiReviewStatus | undefined
	);
	const tone = getModerationStatusChipTone(approvalStatus);

	return (
		<div className="moderation-status-chips" data-testid="moderation-status-chips">
			<span
				className={`moderation-status-chip moderation-status-chip--${tone}`}
				title={t('pages.albumDetail.approvalStatus')}
			>
				{label}
			</span>
		</div>
	);
}
