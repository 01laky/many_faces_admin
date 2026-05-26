import type { HTMLAttributes } from 'react';

export interface TableProps extends HTMLAttributes<HTMLTableElement> {
	variant?: 'surface' | 'ghost' | 'striped';
	size?: '1' | '2' | '3';
}

export interface TableHeaderProps extends HTMLAttributes<HTMLTableSectionElement> {
	asChild?: boolean;
}

export interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {
	asChild?: boolean;
}

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
	asChild?: boolean;
}

export interface TableHeaderCellProps extends HTMLAttributes<HTMLTableCellElement> {
	asChild?: boolean;
}

export interface TableCellProps extends HTMLAttributes<HTMLTableCellElement> {
	asChild?: boolean;
}
