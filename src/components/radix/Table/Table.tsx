import { forwardRef } from 'react';
import * as Slot from '@radix-ui/react-slot';
import './Table.scss';
import type {
	TableBodyProps,
	TableCellProps,
	TableHeaderCellProps,
	TableHeaderProps,
	TableProps,
	TableRowProps,
} from './types';

// Table Root

export const Table = forwardRef<HTMLTableElement, TableProps>(
	({ variant = 'surface', size = '2', className = '', children, ...props }, ref) => {
		return (
			<table
				ref={ref}
				className={`radix-table radix-table--${variant} radix-table--size-${size} ${className}`}
				{...props}
			>
				{children}
			</table>
		);
	}
);
Table.displayName = 'Table';

// Table Header

export const TableHeader = forwardRef<HTMLTableSectionElement, TableHeaderProps>(
	({ asChild, className = '', children, ...props }, ref) => {
		const Comp = asChild ? Slot.Root : 'thead';
		return (
			<Comp ref={ref} className={`radix-table-header ${className}`} {...props}>
				{children}
			</Comp>
		);
	}
);
TableHeader.displayName = 'TableHeader';

// Table Body

export const TableBody = forwardRef<HTMLTableSectionElement, TableBodyProps>(
	({ asChild, className = '', children, ...props }, ref) => {
		const Comp = asChild ? Slot.Root : 'tbody';
		return (
			<Comp ref={ref} className={`radix-table-body ${className}`} {...props}>
				{children}
			</Comp>
		);
	}
);
TableBody.displayName = 'TableBody';

// Table Row

export const TableRow = forwardRef<HTMLTableRowElement, TableRowProps>(
	({ asChild, className = '', children, ...props }, ref) => {
		const Comp = asChild ? Slot.Root : 'tr';
		return (
			<Comp ref={ref} className={`radix-table-row ${className}`} {...props}>
				{children}
			</Comp>
		);
	}
);
TableRow.displayName = 'TableRow';

// Table Header Cell

export const TableHeaderCell = forwardRef<HTMLTableCellElement, TableHeaderCellProps>(
	({ asChild, className = '', children, ...props }, ref) => {
		const Comp = asChild ? Slot.Root : 'th';
		return (
			<Comp ref={ref} className={`radix-table-header-cell ${className}`} {...props}>
				{children}
			</Comp>
		);
	}
);
TableHeaderCell.displayName = 'TableHeaderCell';

// Table Cell

export const TableCell = forwardRef<HTMLTableCellElement, TableCellProps>(
	({ asChild, className = '', children, ...props }, ref) => {
		const Comp = asChild ? Slot.Root : 'td';
		return (
			<Comp ref={ref} className={`radix-table-cell ${className}`} {...props}>
				{children}
			</Comp>
		);
	}
);
TableCell.displayName = 'TableCell';
