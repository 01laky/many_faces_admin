import { forwardRef, type HTMLAttributes } from 'react';
import * as Slot from '@radix-ui/react-slot';
import './Table.scss';

// Table Root
interface TableProps extends HTMLAttributes<HTMLTableElement> {
	variant?: 'surface' | 'ghost' | 'striped';
	size?: '1' | '2' | '3';
}

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
interface TableHeaderProps extends HTMLAttributes<HTMLTableSectionElement> {
	asChild?: boolean;
}

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
interface TableBodyProps extends HTMLAttributes<HTMLTableSectionElement> {
	asChild?: boolean;
}

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
interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
	asChild?: boolean;
}

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
interface TableHeaderCellProps extends HTMLAttributes<HTMLTableCellElement> {
	asChild?: boolean;
}

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
interface TableCellProps extends HTMLAttributes<HTMLTableCellElement> {
	asChild?: boolean;
}

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
