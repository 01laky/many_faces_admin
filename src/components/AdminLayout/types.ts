import type { ReactNode } from 'react';

export interface NavItem {
	path: string;
	labelKey: string;
	icon: string;
}

export interface AdminLayoutProps {
	children: ReactNode;
}
