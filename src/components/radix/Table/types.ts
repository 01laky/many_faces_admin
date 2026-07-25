import type { HTMLAttributes, ThHTMLAttributes, TdHTMLAttributes } from 'react';

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

// Cell props extend the *cell-specific* React attribute sets (Th/Td) rather than the generic
// HTMLAttributes: only those carry `colSpan`/`rowSpan`/`scope`/`headers`. The components render
// <th>/<td> and spread `...props` straight onto them, so these attributes already worked at
// runtime — the narrower base type was simply not describing what the components accept.
export interface TableHeaderCellProps extends ThHTMLAttributes<HTMLTableCellElement> {
	asChild?: boolean;
}

export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
	asChild?: boolean;
}
