import { useTranslation } from 'react-i18next';
import { Button } from '@/components/radix/Button';
import './AdminTablePagination.scss';
import type { AdminTablePaginationProps } from './types';

/**
 * Shared first/prev/next/last controls for TanStack admin tables (10 rows per page by default).
 */
export function AdminTablePagination<T>({
	table,
	totalItems,
	itemLabel,
	className = 'admin-table-pagination',
}: AdminTablePaginationProps<T>) {
	const { t } = useTranslation('common');
	const { pageIndex, pageSize } = table.getState().pagination;
	const pageCount = table.getPageCount();

	if (pageCount <= 1 && totalItems <= pageSize) {
		return null;
	}

	const from = pageIndex * pageSize + 1;
	const to = Math.min((pageIndex + 1) * pageSize, totalItems);

	return (
		<div className={className}>
			<div className="admin-table-pagination__info">
				{t('common.showing')} {from} {t('common.to')} {to} {t('common.of')} {totalItems} {itemLabel}
			</div>
			<div className="admin-table-pagination__controls">
				<Button
					onClick={() => table.setPageIndex(0)}
					disabled={!table.getCanPreviousPage()}
					variant="outline"
				>
					{t('common.first')}
				</Button>
				<Button
					onClick={() => table.previousPage()}
					disabled={!table.getCanPreviousPage()}
					variant="outline"
				>
					{t('common.previous')}
				</Button>
				<span className="admin-table-pagination__page">
					{t('common.page')} {pageIndex + 1} {t('common.of')} {pageCount}
				</span>
				<Button
					onClick={() => table.nextPage()}
					disabled={!table.getCanNextPage()}
					variant="outline"
				>
					{t('common.next')}
				</Button>
				<Button
					onClick={() => table.setPageIndex(pageCount - 1)}
					disabled={!table.getCanNextPage()}
					variant="outline"
				>
					{t('common.last')}
				</Button>
			</div>
		</div>
	);
}
