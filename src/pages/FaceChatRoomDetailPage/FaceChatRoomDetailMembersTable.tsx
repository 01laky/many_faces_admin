import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { ColumnDef, PaginationState, SortingState } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import {
	useFaceChatRoomMembers,
	type FaceChatRoomMemberItem,
} from '@/hooks/api/useFaceChatRoomsApi';
import { Button } from '@/components/radix/Button';
import { Input } from '@/components/radix/Input';
import { useLocalizedLink } from '@/hooks/useLocalizedLink';
import { ADMIN_TABLE_PAGE_SIZE } from '@/utils/adminTableUtils';
import { sortingStateToApi } from '@/utils/adminListQuery';
import { CHAT_ROOM_DETAIL_TEST_IDS } from '@/utils/faceChatRoomDetailUi';

import { FaceDetailEntityTableShell } from '@/components/tables/FaceDetailEntityTableShell/FaceDetailEntityTableShell';

import type { FaceChatRoomDetailMembersTableProps } from './types';

function formatDate(value: string | undefined): string {
	if (!value) return '—';
	const d = new Date(value);
	return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString();
}

export function FaceChatRoomDetailMembersTable({
	faceId,
	roomId,
}: FaceChatRoomDetailMembersTableProps) {
	const { t } = useTranslation('common');
	const navigate = useNavigate();
	const getLocalizedPath = useLocalizedLink();
	const [sorting, setSorting] = useState<SortingState>([{ id: 'joinedAt', desc: true }]);
	const [search, setSearch] = useState('');
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: ADMIN_TABLE_PAGE_SIZE,
	});

	const listParams = {
		faceId,
		roomId,
		page: pagination.pageIndex + 1,
		pageSize: pagination.pageSize,
		search: search.trim() || undefined,
		...sortingStateToApi(sorting),
	};

	const { data, isLoading, isError, error, refetch } = useFaceChatRoomMembers(listParams);

	const openUser = (row: FaceChatRoomMemberItem) => {
		navigate(getLocalizedPath(`/users/${row.userId}`));
	};

	const columns = useMemo<ColumnDef<FaceChatRoomMemberItem>[]>(
		() => [
			{
				accessorKey: 'userId',
				header: t('pages.chatRoomDetail.colMember'),
				enableSorting: true,
				cell: ({ row }) => (
					<Link
						to={getLocalizedPath(`/users/${row.original.userId}`)}
						onClick={(e) => e.stopPropagation()}
						className="font-monospace small"
					>
						{row.original.displayName || row.original.userId}
					</Link>
				),
			},
			{
				accessorKey: 'joinedAt',
				header: t('pages.chatRoomDetail.colJoinedAt'),
				enableSorting: true,
				cell: ({ getValue }) => formatDate(getValue() as string | undefined),
			},
		],
		[t, getLocalizedPath]
	);

	const toolbar = (
		<div className="admin-data-table-section__toolbar">
			<Input
				type="text"
				placeholder={t('pages.chatRoomDetail.membersSearchPlaceholder')}
				value={search}
				onChange={(e) => {
					setSearch(e.target.value);
					setPagination((prev) => ({ ...prev, pageIndex: 0 }));
				}}
				className="admin-data-table-section__search"
			/>
			<Button onClick={() => void refetch()}>{t('common.refresh')}</Button>
		</div>
	);

	return (
		<div data-testid={CHAT_ROOM_DETAIL_TEST_IDS.members}>
			<FaceDetailEntityTableShell
				sectionTitle={t('pages.chatRoomDetail.membersSection')}
				emptyMessage={t('pages.chatRoomDetail.membersEmpty')}
				loadingMessage={t('common.loading')}
				errorMessagePrefix={t('pages.chatRoomsTable.error')}
				itemLabel={t('pages.chatRoomDetail.membersSection')}
				columns={columns}
				data={data?.items ?? []}
				totalCount={data?.totalCount ?? 0}
				totalPages={data?.totalPages ?? 0}
				isLoading={isLoading}
				isError={isError}
				error={error}
				refetch={() => void refetch()}
				sorting={sorting}
				onSortingChange={setSorting}
				pagination={pagination}
				onPaginationChange={setPagination}
				headerActions={toolbar}
				onRowClick={openUser}
			/>
		</div>
	);
}
