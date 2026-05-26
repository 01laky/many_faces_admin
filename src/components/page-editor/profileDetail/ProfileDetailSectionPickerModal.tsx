import { useTranslation } from 'react-i18next';
import { Button } from '@/components/radix/Button';
import { PROFILE_DETAIL_SECTION_TYPES, type ProfileDetailSectionPickerModalProps } from './types';
import './ProfileDetailSectionPickerModal.scss';

export function ProfileDetailSectionPickerModal({
	open,
	currentType,
	onSelect,
	onClear,
	onClose,
}: ProfileDetailSectionPickerModalProps) {
	const { t } = useTranslation('common');

	if (!open) return null;

	return (
		<div className="profile-detail-section-picker-overlay" role="dialog" aria-modal="true">
			<div className="profile-detail-section-picker">
				<header>
					<h4>{t('pages.profileDetailTemplate.pickerTitle')}</h4>
					<button type="button" className="profile-detail-section-picker__close" onClick={onClose}>
						×
					</button>
				</header>
				<div className="profile-detail-section-picker__grid">
					{PROFILE_DETAIL_SECTION_TYPES.map((type) => (
						<Button
							key={type}
							type="button"
							variant={currentType === type ? 'default' : 'outline'}
							onClick={() => onSelect(type)}
						>
							{t(`pages.profileDetailTemplate.sections.${type}`)}
						</Button>
					))}
				</div>
				{currentType && (
					<Button type="button" variant="outline" onClick={onClear}>
						{t('pages.profileDetailTemplate.clearSection')}
					</Button>
				)}
			</div>
		</div>
	);
}
