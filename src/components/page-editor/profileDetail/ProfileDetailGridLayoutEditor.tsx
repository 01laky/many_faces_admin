import { useState, useCallback, useMemo } from 'react';
import { ResponsiveGridLayout, useContainerWidth, verticalCompactor } from 'react-grid-layout';
import type { LayoutItem, Layout, ResponsiveLayouts } from 'react-grid-layout';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/radix/Button';
import { ProfileDetailSectionPickerModal } from './ProfileDetailSectionPickerModal';
import type {
	ProfileDetailGridItem,
	ProfileDetailGridSchema,
	ProfileDetailSectionType,
} from './types';
import { DEFAULT_PROFILE_DETAIL_GRID_SCHEMA } from './defaultProfileDetailSchema';
import '../GridLayoutEditor/GridLayoutEditor.scss';

interface ProfileDetailGridLayoutEditorProps {
	value: ProfileDetailGridSchema | null;
	onChange: (schema: ProfileDetailGridSchema) => void;
}

let itemCounter = 0;

export function ProfileDetailGridLayoutEditor({
	value,
	onChange,
}: ProfileDetailGridLayoutEditorProps) {
	const { t } = useTranslation('common');

	const schema = useMemo<ProfileDetailGridSchema>(
		() =>
			value || {
				...DEFAULT_PROFILE_DETAIL_GRID_SCHEMA,
				schemaVersion: 1,
			},
		[value]
	);

	const [pickerItemId, setPickerItemId] = useState<string | null>(null);
	const { width, containerRef } = useContainerWidth();

	const layouts = useMemo<ResponsiveLayouts>(() => {
		// react-grid-layout expects one layout per breakpoint. The profile detail editor
		// stores a single canonical layout because the portal currently renders the same
		// section order across breakpoints, so each breakpoint receives the same item map.
		const baseLayout: LayoutItem[] = schema.items.map((item) => ({
			i: item.i,
			x: item.x,
			y: item.y,
			w: item.w,
			h: item.h,
			minW: item.minW || 1,
			minH: item.minH || 1,
		}));
		return {
			lg: baseLayout,
			md: baseLayout,
			sm: baseLayout,
			xs: baseLayout,
			xxs: baseLayout,
		};
	}, [schema]);

	const applyLayoutToSchema = useCallback(
		(layout: Layout) => {
			const updatedItems = layout.map((layoutItem: LayoutItem) => {
				const existing = schema.items.find((item) => item.i === layoutItem.i);
				// Preserve section metadata while copying the latest drag/resize geometry
				// from the grid library. New library-created items still get a stable label
				// so the admin can see and edit them before assigning a section type.
				return {
					...existing,
					i: layoutItem.i,
					x: layoutItem.x,
					y: layoutItem.y,
					w: layoutItem.w,
					h: layoutItem.h,
					minW: layoutItem.minW ?? existing?.minW ?? 1,
					minH: layoutItem.minH ?? existing?.minH ?? 1,
					label: existing?.label || layoutItem.i,
					sectionType: existing?.sectionType,
					props: existing?.props,
				} as ProfileDetailGridItem;
			});
			onChange({
				...schema,
				schemaVersion: 1,
				items: updatedItems,
			});
		},
		[schema, onChange]
	);

	const addItem = useCallback(() => {
		itemCounter += 1;
		const id = `section-${Date.now()}-${itemCounter}`;
		const newItem: ProfileDetailGridItem = {
			i: id,
			x: 0,
			y: Infinity,
			w: 12,
			h: 2,
			minW: 1,
			minH: 1,
			label: id,
		};
		// y=Infinity asks react-grid-layout to append the item after the current layout
		// instead of overlapping the first row. The compacted coordinates are persisted
		// through applyLayoutToSchema after the grid recalculates.
		onChange({
			...schema,
			schemaVersion: 1,
			items: [...schema.items, newItem],
		});
	}, [schema, onChange]);

	const removeItem = useCallback(
		(itemId: string) => {
			onChange({
				...schema,
				schemaVersion: 1,
				items: schema.items.filter((item) => item.i !== itemId),
			});
		},
		[schema, onChange]
	);

	const pickerItem = useMemo(
		() => (pickerItemId ? schema.items.find((i) => i.i === pickerItemId) : undefined),
		[pickerItemId, schema.items]
	);

	const handleSelectSection = useCallback(
		(type: ProfileDetailSectionType) => {
			if (!pickerItemId) return;
			onChange({
				...schema,
				schemaVersion: 1,
				items: schema.items.map((item) =>
					item.i === pickerItemId ? { ...item, sectionType: type } : item
				),
			});
			setPickerItemId(null);
		},
		[pickerItemId, schema, onChange]
	);

	const handleClearSection = useCallback(() => {
		if (!pickerItemId) return;
		onChange({
			...schema,
			schemaVersion: 1,
			items: schema.items.map((item) =>
				item.i === pickerItemId ? { ...item, sectionType: undefined } : item
			),
		});
		setPickerItemId(null);
	}, [pickerItemId, schema, onChange]);

	const sectionLabel = (type?: ProfileDetailSectionType) => {
		if (!type) return null;
		return t(`pages.profileDetailTemplate.sections.${type}`);
	};

	return (
		<div className="grid-layout-editor" ref={containerRef}>
			<div className="grid-layout-toolbar">
				<Button type="button" onClick={addItem} variant="outline">
					+ {t('pages.profileDetailTemplate.addSection')}
				</Button>
				<span className="grid-item-count">
					{schema.items.length} {t('pages.profileDetailTemplate.sectionsCount')}
				</span>
			</div>

			<div className="grid-layout-canvas">
				{schema.items.length === 0 ? (
					<div className="grid-layout-empty">
						<p>{t('pages.profileDetailTemplate.empty')}</p>
					</div>
				) : (
					<ResponsiveGridLayout
						className="layout"
						width={width}
						layouts={layouts}
						breakpoints={schema.breakpoints}
						cols={schema.cols}
						rowHeight={schema.rowHeight}
						onLayoutChange={(layout) => applyLayoutToSchema(layout)}
						onDragStop={(layout) => applyLayoutToSchema(layout)}
						onResizeStop={(layout) => applyLayoutToSchema(layout)}
						dragConfig={{ enabled: true }}
						resizeConfig={{ enabled: true }}
						compactor={verticalCompactor}
						margin={[8, 8]}
					>
						{schema.items.map((item) => (
							<div key={item.i} className="grid-item-wrapper">
								<div className="grid-item-content">
									<div className="grid-item-header">
										<span className="grid-item-label">{item.label || item.i}</span>
										<button
											type="button"
											className="grid-item-remove"
											onClick={() => removeItem(item.i)}
											title={t('pages.editPage.gridLayout.removeItem')}
										>
											×
										</button>
									</div>
									<div
										className="grid-item-body"
										onClick={() => setPickerItemId(item.i)}
										onKeyDown={(e) => {
											if (e.key === 'Enter') setPickerItemId(item.i);
										}}
										role="button"
										tabIndex={0}
									>
										{item.sectionType ? (
											<span className="grid-item-component-badge">
												{sectionLabel(item.sectionType)}
											</span>
										) : (
											<span className="grid-item-component-placeholder">
												+ {t('pages.profileDetailTemplate.assignSection')}
											</span>
										)}
									</div>
								</div>
							</div>
						))}
					</ResponsiveGridLayout>
				)}
			</div>

			<ProfileDetailSectionPickerModal
				open={pickerItemId !== null}
				currentType={pickerItem?.sectionType}
				onSelect={handleSelectSection}
				onClear={handleClearSection}
				onClose={() => setPickerItemId(null)}
			/>
		</div>
	);
}
