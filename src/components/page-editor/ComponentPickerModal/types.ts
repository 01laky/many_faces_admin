import type { GridComponentType } from '../GridLayoutEditor';

export interface ComponentOption {
	type: GridComponentType;
	labelKey: string;
	descriptionKey: string;
	icon: string;
}

export interface ComponentCategory {
	id: string;
	labelKey: string;
	icon: string;
	options: ComponentOption[];
}

export interface ComponentPickerModalProps {
	open: boolean;
	currentType?: GridComponentType;
	onSelect: (type: GridComponentType) => void;
	onClear: () => void;
	onClose: () => void;
}
