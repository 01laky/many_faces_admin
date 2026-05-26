export interface GradientSettings {
	type: 'linear' | 'radial';
	colors: string[];
	angle: number;
	animation: 'none' | 'rotate' | 'shift' | 'pulse';
	animationSpeed: number;
}

export interface GradientPickerProps {
	value?: string | null;
	onChange: (value: string) => void;
	disabled?: boolean;
}
