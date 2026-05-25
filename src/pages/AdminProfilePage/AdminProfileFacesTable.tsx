import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from '@tanstack/react-table';
import type { AdminMeFaceRow } from '@/api/adminMeProfileApiClient';
import type { FaceRoleOption } from '@/hooks/api/useOperatorUsersApi';
import {
	Table,
	TableHeader,
	TableBody,
	TableRow,
	TableHeaderCell,
	TableCell,
} from '@/components/radix/Table';

export interface AdminProfileFacesTableProps {
	faces: AdminMeFaceRow[];
	faceRoles: FaceRoleOption[];
	onRoleChange: (faceId: number, userRoleId: number) => void;
	roleChangePending: boolean;
}

/** Per-face role grid on admin self-profile (no ban/moderation controls). */
export function AdminProfileFacesTable({
	faces,
	faceRoles,
	onRoleChange,
	roleChangePending,
}: AdminProfileFacesTableProps) {
	const { t } = useTranslation('common');

	const columns = useMemo<ColumnDef<AdminMeFaceRow>[]>(
		() => [
			{
				id: 'face',
				header: () => t('pages.adminProfile.faceColumnTitle'),
				cell: ({ row }) => (
					<>
						<strong>{row.original.faceTitle}</strong>
						<div className="user-detail-face-index">{row.original.faceIndex}</div>
					</>
				),
			},
			{
				id: 'role',
				header: () => t('pages.adminProfile.faceColumnRole'),
				cell: ({ row }) => {
					const face = row.original;
					return (
						<select
							className="user-detail-role-select"
							value={face.userRoleId}
							disabled={roleChangePending}
							onChange={(e) => onRoleChange(face.faceId, Number(e.target.value))}
						>
							{faceRoles.map((role) => (
								<option key={role.id} value={role.id}>
									{role.name}
								</option>
							))}
						</select>
					);
				},
			},
			{
				id: 'status',
				header: () => t('pages.userDetail.faceColumnStatus'),
				cell: ({ row }) => (
					<span className="user-detail-badge">
						{row.original.isActiveParticipant
							? t('pages.adminProfile.activeParticipant')
							: t('pages.adminProfile.hostOnly')}
					</span>
				),
			},
		],
		[faceRoles, onRoleChange, roleChangePending, t]
	);

	const table = useReactTable({
		data: faces,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	if (faces.length === 0) {
		return <p className="admin-profile-empty-faces">{t('pages.adminProfile.noFaces')}</p>;
	}

	return (
		<Table className="admin-data-table">
			<TableHeader>
				{table.getHeaderGroups().map((headerGroup) => (
					<TableRow key={headerGroup.id}>
						{headerGroup.headers.map((header) => (
							<TableHeaderCell key={header.id}>
								{flexRender(header.column.columnDef.header, header.getContext())}
							</TableHeaderCell>
						))}
					</TableRow>
				))}
			</TableHeader>
			<TableBody>
				{table.getRowModel().rows.map((row) => (
					<TableRow key={row.id}>
						{row.getVisibleCells().map((cell) => (
							<TableCell key={cell.id}>
								{flexRender(cell.column.columnDef.cell, cell.getContext())}
							</TableCell>
						))}
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
