import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ColumnDef, PaginationState, SortingState } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { useUsers, type User } from '@/hooks/api/useUsersApi';
import { Button } from '@/components/radix/Button';
import { Input } from '@/components/radix/Input';
import { useLocalizedLink } from '@/hooks/useLocalizedLink';
import { ADMIN_TABLE_PAGE_SIZE } from '@/utils/adminTableUtils';
import { sortingStateToApi } from '@/utils/adminListQuery';
import { FaceDetailEntityTableShell } from '@/components/tables/FaceDetailEntityTableShell/FaceDetailEntityTableShell';

export function UsersTable() {
	const { t } = useTranslation('common');
	const navigate = useNavigate();
	const getLocalizedPath = useLocalizedLink();
	const [sorting, setSorting] = useState<SortingState>([{ id: 'createdAt', desc: true }]);
	const [search, setSearch] = useState('');
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: ADMIN_TABLE_PAGE_SIZE,
	});

	const { data, isLoading, isError, error, refetch } = useUsers({
		page: pagination.pageIndex + 1,
		pageSize: pagination.pageSize,
		search: search.trim() || undefined,
		...sortingStateToApi(sorting),
	});

	const columns = useMemo<ColumnDef<User>[]>(
		() => [
			{
				accessorKey: 'id',
				header: 'ID',
				enableSorting: true,
				cell: (info) => <span className="font-monospace small">{String(info.getValue())}</span>,
			},
			{
				accessorKey: 'email',
				header: t('pages.users.colEmail'),
				enableSorting: true,
			},
			{
				accessorKey: 'firstName',
				header: t('pages.users.colFirstName'),
				enableSorting: true,
				cell: (info) => info.getValue() || '—',
			},
			{
				accessorKey: 'lastName',
				header: t('pages.users.colLastName'),
				enableSorting: true,
				cell: (info) => info.getValue() || '—',
			},
			{
				accessorKey: 'createdAt',
				header: t('pages.users.colCreatedAt'),
				enableSorting: true,
				cell: (info) => {
					const date = info.getValue() as string | undefined;
					return date ? new Date(date).toLocaleString() : '—';
				},
			},
		],
		[t]
	);

	const headerToolbar = (
		<div className="admin-data-table-section__toolbar">
			<Input
				type="text"
				placeholder={t('pages.users.searchPlaceholder')}
				value={search}
				onChange={(e) => {
					setSearch(e.target.value);
					setPagination((prev) => ({ ...prev, pageIndex: 0 }));
				}}
				className="admin-data-table-section__search"
			/>
			<Button onClick={() => void refetch()}>{t('common.refresh')}</Button>
			<Button onClick={() => navigate(getLocalizedPath('/users/create'))}>
				{t('pages.users.create')}
			</Button>
		</div>
	);

	return (
		<FaceDetailEntityTableShell
			sectionClassName="admin-data-table-section--page-root"
			sectionTitle={t('pages.users.title')}
			emptyMessage={t('pages.users.noUsers')}
			loadingMessage={t('pages.users.loading')}
			errorMessagePrefix={t('pages.users.error')}
			itemLabel={t('pages.users.users')}
			columns={columns}
			data={data?.users ?? []}
			totalCount={data?.total ?? 0}
			totalPages={data?.totalPages ?? 0}
			isLoading={isLoading}
			isError={isError}
			error={error}
			refetch={() => void refetch()}
			sorting={sorting}
			onSortingChange={setSorting}
			pagination={pagination}
			onPaginationChange={setPagination}
			headerActions={headerToolbar}
			onRowClick={(user) => navigate(getLocalizedPath(`/users/${user.id}`))}
		/>
	);
}
