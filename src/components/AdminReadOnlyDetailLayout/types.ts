import type { ReactNode } from 'react';

export interface DetailField {
	label: string;
	value: ReactNode;
}

export interface AdminReadOnlyDetailLayoutProps {
	title: string;
	backFaceId: number;
	fields?: DetailField[];
	beforeFields?: ReactNode;
	/** When true, only the back control is shown (page supplies its own title in beforeFields). */
	hideTitle?: boolean;
	className?: string;
	isLoading?: boolean;
	isError?: boolean;
	errorMessage?: string;
}
