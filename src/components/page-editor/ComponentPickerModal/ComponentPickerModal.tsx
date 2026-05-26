import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useTranslation } from 'react-i18next';
import type { GridComponentType } from '../GridLayoutEditor';
import './ComponentPickerModal.scss';

import type { ComponentCategory, ComponentPickerModalProps } from './types';

const CATEGORIES: ComponentCategory[] = [
	{
		id: 'albums',
		labelKey: 'pages.editPage.gridLayout.categories.albums',
		icon: '🖼️',
		options: [
			{
				type: 'album',
				labelKey: 'pages.editPage.gridLayout.components.album',
				descriptionKey: 'pages.editPage.gridLayout.components.albumDesc',
				icon: '🖼️',
			},
			{
				type: 'albumGrid',
				labelKey: 'pages.editPage.gridLayout.components.albumGrid',
				descriptionKey: 'pages.editPage.gridLayout.components.albumGridDesc',
				icon: '⊞',
			},
			{
				type: 'albumCarousel',
				labelKey: 'pages.editPage.gridLayout.components.albumCarousel',
				descriptionKey: 'pages.editPage.gridLayout.components.albumCarouselDesc',
				icon: '⏩',
			},
		],
	},
	{
		id: 'ads',
		labelKey: 'pages.editPage.gridLayout.categories.ads',
		icon: '📢',
		options: [
			{
				type: 'ad',
				labelKey: 'pages.editPage.gridLayout.components.ad',
				descriptionKey: 'pages.editPage.gridLayout.components.adDesc',
				icon: '📢',
			},
			{
				type: 'adGrid',
				labelKey: 'pages.editPage.gridLayout.components.adGrid',
				descriptionKey: 'pages.editPage.gridLayout.components.adGridDesc',
				icon: '⊞',
			},
			{
				type: 'adCarousel',
				labelKey: 'pages.editPage.gridLayout.components.adCarousel',
				descriptionKey: 'pages.editPage.gridLayout.components.adCarouselDesc',
				icon: '⏩',
			},
		],
	},
	{
		id: 'blog',
		labelKey: 'pages.editPage.gridLayout.categories.blog',
		icon: '📝',
		options: [
			{
				type: 'blog',
				labelKey: 'pages.editPage.gridLayout.components.blog',
				descriptionKey: 'pages.editPage.gridLayout.components.blogDesc',
				icon: '📝',
			},
			{
				type: 'blogGrid',
				labelKey: 'pages.editPage.gridLayout.components.blogGrid',
				descriptionKey: 'pages.editPage.gridLayout.components.blogGridDesc',
				icon: '⊞',
			},
			{
				type: 'blogCarousel',
				labelKey: 'pages.editPage.gridLayout.components.blogCarousel',
				descriptionKey: 'pages.editPage.gridLayout.components.blogCarouselDesc',
				icon: '⏩',
			},
		],
	},
	{
		id: 'chatRooms',
		labelKey: 'pages.editPage.gridLayout.categories.chatRooms',
		icon: '💬',
		options: [
			{
				type: 'chatRoom',
				labelKey: 'pages.editPage.gridLayout.components.chatRoom',
				descriptionKey: 'pages.editPage.gridLayout.components.chatRoomDesc',
				icon: '💬',
			},
			{
				type: 'chatRoomGrid',
				labelKey: 'pages.editPage.gridLayout.components.chatRoomGrid',
				descriptionKey: 'pages.editPage.gridLayout.components.chatRoomGridDesc',
				icon: '⊞',
			},
			{
				type: 'chatRoomCarousel',
				labelKey: 'pages.editPage.gridLayout.components.chatRoomCarousel',
				descriptionKey: 'pages.editPage.gridLayout.components.chatRoomCarouselDesc',
				icon: '⏩',
			},
		],
	},
	{
		id: 'videoLounges',
		labelKey: 'pages.editPage.gridLayout.categories.videoLounges',
		icon: '🎙️',
		options: [
			{
				type: 'videoLounge',
				labelKey: 'pages.editPage.gridLayout.components.videoLounge',
				descriptionKey: 'pages.editPage.gridLayout.components.videoLoungeDesc',
				icon: '🎙️',
			},
			{
				type: 'videoLoungeGrid',
				labelKey: 'pages.editPage.gridLayout.components.videoLoungeGrid',
				descriptionKey: 'pages.editPage.gridLayout.components.videoLoungeGridDesc',
				icon: '⊞',
			},
			{
				type: 'videoLoungeCarousel',
				labelKey: 'pages.editPage.gridLayout.components.videoLoungeCarousel',
				descriptionKey: 'pages.editPage.gridLayout.components.videoLoungeCarouselDesc',
				icon: '⏩',
			},
		],
	},
	{
		id: 'userProfiles',
		labelKey: 'pages.editPage.gridLayout.categories.userProfiles',
		icon: '👤',
		options: [
			{
				type: 'userProfile',
				labelKey: 'pages.editPage.gridLayout.components.userProfile',
				descriptionKey: 'pages.editPage.gridLayout.components.userProfileDesc',
				icon: '👤',
			},
			{
				type: 'userProfileGrid',
				labelKey: 'pages.editPage.gridLayout.components.userProfileGrid',
				descriptionKey: 'pages.editPage.gridLayout.components.userProfileGridDesc',
				icon: '⊞',
			},
			{
				type: 'userProfileCarousel',
				labelKey: 'pages.editPage.gridLayout.components.userProfileCarousel',
				descriptionKey: 'pages.editPage.gridLayout.components.userProfileCarouselDesc',
				icon: '⏩',
			},
		],
	},
	{
		id: 'reels',
		labelKey: 'pages.editPage.gridLayout.categories.reels',
		icon: '🎬',
		options: [
			{
				type: 'reel',
				labelKey: 'pages.editPage.gridLayout.components.reel',
				descriptionKey: 'pages.editPage.gridLayout.components.reelDesc',
				icon: '🎬',
			},
			{
				type: 'reelGrid',
				labelKey: 'pages.editPage.gridLayout.components.reelGrid',
				descriptionKey: 'pages.editPage.gridLayout.components.reelGridDesc',
				icon: '⊞',
			},
			{
				type: 'reelCarousel',
				labelKey: 'pages.editPage.gridLayout.components.reelCarousel',
				descriptionKey: 'pages.editPage.gridLayout.components.reelCarouselDesc',
				icon: '⏩',
			},
		],
	},
	{
		id: 'stories',
		labelKey: 'pages.editPage.gridLayout.categories.stories',
		icon: '⭕',
		options: [
			{
				type: 'story',
				labelKey: 'pages.editPage.gridLayout.components.story',
				descriptionKey: 'pages.editPage.gridLayout.components.storyDesc',
				icon: '⭕',
			},
			{
				type: 'storyGrid',
				labelKey: 'pages.editPage.gridLayout.components.storyGrid',
				descriptionKey: 'pages.editPage.gridLayout.components.storyGridDesc',
				icon: '⊞',
			},
			{
				type: 'storyCarousel',
				labelKey: 'pages.editPage.gridLayout.components.storyCarousel',
				descriptionKey: 'pages.editPage.gridLayout.components.storyCarouselDesc',
				icon: '⏩',
			},
		],
	},
];

function getCategoryForType(type?: GridComponentType): string {
	if (!type) return CATEGORIES[0].id;
	for (const cat of CATEGORIES) {
		if (cat.options.some((o) => o.type === type)) return cat.id;
	}
	return CATEGORIES[0].id;
}

export function ComponentPickerModal({
	open,
	currentType,
	onSelect,
	onClear,
	onClose,
}: ComponentPickerModalProps) {
	const { t } = useTranslation('common');
	const [activeTab, setActiveTab] = useState(() => getCategoryForType(currentType));

	const activeCategory = CATEGORIES.find((c) => c.id === activeTab) || CATEGORIES[0];

	return (
		<Dialog.Root
			open={open}
			onOpenChange={(v) => {
				if (!v) onClose();
				else setActiveTab(getCategoryForType(currentType));
			}}
		>
			<Dialog.Portal>
				<Dialog.Overlay className="component-picker-overlay" />
				<Dialog.Content className="component-picker-content">
					<Dialog.Title className="component-picker-title">
						{t('pages.editPage.gridLayout.components.title')}
					</Dialog.Title>
					<Dialog.Description className="component-picker-description">
						{t('pages.editPage.gridLayout.components.description')}
					</Dialog.Description>

					<div className="component-picker-tabs">
						{CATEGORIES.map((cat) => (
							<button
								key={cat.id}
								className={`component-picker-tab ${activeTab === cat.id ? 'active' : ''}`}
								onClick={() => setActiveTab(cat.id)}
							>
								<span className="component-picker-tab-icon">{cat.icon}</span>
								<span className="component-picker-tab-label">{t(cat.labelKey)}</span>
							</button>
						))}
					</div>

					<div className="component-picker-grid">
						{activeCategory.options.map((option) => (
							<button
								key={option.type}
								className={`component-picker-option ${currentType === option.type ? 'selected' : ''}`}
								onClick={() => onSelect(option.type)}
							>
								<div className="component-option-icon">{option.icon}</div>
								<div className="component-option-info">
									<span className="component-option-label">{t(option.labelKey)}</span>
									<span className="component-option-desc">{t(option.descriptionKey)}</span>
								</div>
								{currentType === option.type && <span className="component-option-check">✓</span>}
							</button>
						))}
					</div>

					{currentType && (
						<button className="component-picker-clear" onClick={onClear}>
							{t('pages.editPage.gridLayout.components.clear')}
						</button>
					)}

					<Dialog.Close asChild>
						<button className="component-picker-close" aria-label="Close">
							×
						</button>
					</Dialog.Close>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
