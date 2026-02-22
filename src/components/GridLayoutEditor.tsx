import { useState, useCallback, useMemo } from 'react';
import { ResponsiveGridLayout, useContainerWidth, verticalCompactor } from 'react-grid-layout';
import type { LayoutItem, Layout, ResponsiveLayouts } from 'react-grid-layout';
import { useTranslation } from 'react-i18next';
import { Button } from './radix/Button';
import { ComponentPickerModal } from './ComponentPickerModal';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './GridLayoutEditor.scss';

export type GridComponentType =
	| 'album'
	| 'albumGrid'
	| 'albumCarousel'
	| 'ad'
	| 'adGrid'
	| 'adCarousel'
	| 'blog'
	| 'blogGrid'
	| 'blogCarousel'
	| 'chatRoom'
	| 'chatRoomGrid'
	| 'chatRoomCarousel'
	| 'userProfile'
	| 'userProfileGrid'
	| 'userProfileCarousel'
	| 'reel'
	| 'reelGrid'
	| 'reelCarousel'
	| 'story'
	| 'storyGrid'
	| 'storyCarousel';

export interface GridItem {
	i: string;
	x: number;
	y: number;
	w: number;
	h: number;
	minW?: number;
	minH?: number;
	label?: string;
	componentType?: GridComponentType;
}

export interface GridSchema {
	items: GridItem[];
	breakpoints: Record<string, number>;
	cols: Record<string, number>;
	rowHeight: number;
}

const DEFAULT_BREAKPOINTS = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
const DEFAULT_COLS = { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 };
const DEFAULT_ROW_HEIGHT = 80;

interface GridLayoutEditorProps {
	value: GridSchema | null;
	onChange: (schema: GridSchema) => void;
}

let itemCounter = 0;

export function GridLayoutEditor({ value, onChange }: GridLayoutEditorProps) {
	const { t } = useTranslation('common');

	const schema = useMemo<GridSchema>(
		() =>
			value || {
				items: [],
				breakpoints: DEFAULT_BREAKPOINTS,
				cols: DEFAULT_COLS,
				rowHeight: DEFAULT_ROW_HEIGHT,
			},
		[value]
	);

	const [editingLabel, setEditingLabel] = useState<string | null>(null);
	const [labelValue, setLabelValue] = useState('');
	const { width, containerRef } = useContainerWidth();

	const layouts = useMemo<ResponsiveLayouts>(() => {
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

	const handleLayoutChange = useCallback(
		(currentLayout: Layout, _allLayouts: ResponsiveLayouts) => {
			const lgLayout = _allLayouts.lg || currentLayout;
			const updatedItems = lgLayout.map((layoutItem: LayoutItem) => {
				const existing = schema.items.find((item) => item.i === layoutItem.i);
				return {
					i: layoutItem.i,
					x: layoutItem.x,
					y: layoutItem.y,
					w: layoutItem.w,
					h: layoutItem.h,
					minW: layoutItem.minW || 1,
					minH: layoutItem.minH || 1,
					label: existing?.label || layoutItem.i,
					componentType: existing?.componentType,
				};
			});
			onChange({
				...schema,
				items: updatedItems,
			});
		},
		[schema, onChange]
	);

	const addItem = useCallback(() => {
		itemCounter += 1;
		const id = `item-${Date.now()}-${itemCounter}`;
		const newItem: GridItem = {
			i: id,
			x: 0,
			y: Infinity, // places at bottom
			w: 3,
			h: 2,
			minW: 1,
			minH: 1,
			label: `Block ${schema.items.length + 1}`,
		};
		onChange({
			...schema,
			items: [...schema.items, newItem],
		});
	}, [schema, onChange]);

	const removeItem = useCallback(
		(itemId: string) => {
			onChange({
				...schema,
				items: schema.items.filter((item) => item.i !== itemId),
			});
		},
		[schema, onChange]
	);

	const startEditLabel = (itemId: string) => {
		const item = schema.items.find((i) => i.i === itemId);
		setEditingLabel(itemId);
		setLabelValue(item?.label || itemId);
	};

	const saveLabel = () => {
		if (editingLabel) {
			onChange({
				...schema,
				items: schema.items.map((item) =>
					item.i === editingLabel ? { ...item, label: labelValue } : item
				),
			});
			setEditingLabel(null);
			setLabelValue('');
		}
	};

	const [pickerItemId, setPickerItemId] = useState<string | null>(null);

	const pickerItem = useMemo(
		() => (pickerItemId ? schema.items.find((i) => i.i === pickerItemId) : undefined),
		[pickerItemId, schema.items]
	);

	const handleSelectComponent = useCallback(
		(type: GridComponentType) => {
			if (!pickerItemId) return;
			onChange({
				...schema,
				items: schema.items.map((item) =>
					item.i === pickerItemId ? { ...item, componentType: type } : item
				),
			});
			setPickerItemId(null);
		},
		[pickerItemId, schema, onChange]
	);

	const handleClearComponent = useCallback(() => {
		if (!pickerItemId) return;
		onChange({
			...schema,
			items: schema.items.map((item) =>
				item.i === pickerItemId ? { ...item, componentType: undefined } : item
			),
		});
		setPickerItemId(null);
	}, [pickerItemId, schema, onChange]);

	const componentLabel = (type?: GridComponentType) => {
		if (!type) return null;
		return t(`pages.editPage.gridLayout.components.${type}`);
	};

	return (
		<div className="grid-layout-editor" ref={containerRef}>
			<div className="grid-layout-toolbar">
				<Button type="button" onClick={addItem} variant="outline">
					+ {t('pages.editPage.gridLayout.addItem')}
				</Button>
				<span className="grid-item-count">
					{schema.items.length} {t('pages.editPage.gridLayout.items')}
				</span>
			</div>

			<div className="grid-layout-canvas">
				{schema.items.length === 0 ? (
					<div className="grid-layout-empty">
						<p>{t('pages.editPage.gridLayout.empty')}</p>
					</div>
				) : (
					<ResponsiveGridLayout
						className="layout"
						width={width}
						layouts={layouts}
						breakpoints={schema.breakpoints}
						cols={schema.cols}
						rowHeight={schema.rowHeight}
						onLayoutChange={handleLayoutChange}
						dragConfig={{ enabled: true }}
						resizeConfig={{ enabled: true }}
						compactor={verticalCompactor}
						margin={[8, 8]}
					>
						{schema.items.map((item) => (
							<div key={item.i} className="grid-item-wrapper">
								<div className="grid-item-content">
									<div className="grid-item-header">
										{editingLabel === item.i ? (
											<div className="grid-item-label-edit">
												<input
													type="text"
													value={labelValue}
													onChange={(e) => setLabelValue(e.target.value)}
													onBlur={saveLabel}
													onKeyDown={(e) => {
														if (e.key === 'Enter') saveLabel();
														if (e.key === 'Escape') setEditingLabel(null);
													}}
													autoFocus
												/>
											</div>
										) : (
											<span
												className="grid-item-label"
												onDoubleClick={() => startEditLabel(item.i)}
												title={t('pages.editPage.gridLayout.doubleClickToEdit')}
											>
												{item.label || item.i}
											</span>
										)}
										<button
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
										title={t('pages.editPage.gridLayout.components.clickToAssign')}
									>
										{item.componentType ? (
											<span className="grid-item-component-badge">
												{componentLabel(item.componentType)}
											</span>
										) : (
											<span className="grid-item-component-placeholder">
												+ {t('pages.editPage.gridLayout.components.assign')}
											</span>
										)}
									</div>
								</div>
							</div>
						))}
					</ResponsiveGridLayout>
				)}
			</div>

			<ComponentPickerModal
				open={pickerItemId !== null}
				currentType={pickerItem?.componentType}
				onSelect={handleSelectComponent}
				onClear={handleClearComponent}
				onClose={() => setPickerItemId(null)}
			/>
		</div>
	);
}
