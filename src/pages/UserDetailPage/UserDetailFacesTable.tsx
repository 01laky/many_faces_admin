import { useMemo, type Dispatch, type SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from '@tanstack/react-table';
import type { OperatorUserFaceRow } from '@/hooks/api/useOperatorUsersApi';
import type { FaceRoleOption } from '@/hooks/api/useOperatorUsersApi';
import {
	Table,
	TableHeader,
	TableBody,
	TableRow,
	TableHeaderCell,
	TableCell,
} from '@/components/radix/Table';
import { Button } from '@/components/radix/Button';
import { canSubmitFaceBan, getFaceStatusI18nKey } from '@/utils/operatorUserDetailUi';

export interface UserDetailFacesTableProps {
	faces: OperatorUserFaceRow[];
	faceRoles: FaceRoleOption[];
	faceBanReasonById: Record<number, string>;
	setFaceBanReasonById: Dispatch<SetStateAction<Record<number, string>>>;
	onRoleChange: (faceId: number, userRoleId: number) => void;
	onFaceBan: (faceId: number) => void;
	onFaceUnban: (faceId: number) => void;
	roleChangePending: boolean;
	faceBanPending: boolean;
	faceUnbanPending: boolean;
}

/**
 * Per-face membership grid on the operator user detail console.
 * Inline role select and ban controls stay in cell renderers; parent owns mutations.
 */
export function UserDetailFacesTable({
	faces,
	faceRoles,
	faceBanReasonById,
	setFaceBanReasonById,
	onRoleChange,
	onFaceBan,
	onFaceUnban,
	roleChangePending,
	faceBanPending,
	faceUnbanPending,
}: UserDetailFacesTableProps) {
	const { t } = useTranslation('common');

	const columns = useMemo<ColumnDef<OperatorUserFaceRow>[]>(
		() => [
			{
				id: 'face',
				header: () => t('pages.userDetail.faceColumnTitle'),
				cell: ({ row }) => (
					<>
						<strong>{row.original.faceTitle}</strong>
						<div className="user-detail-face-index">{row.original.faceIndex}</div>
					</>
				),
			},
			{
				id: 'role',
				header: () => t('pages.userDetail.faceColumnRole'),
				cell: ({ row }) => {
					const face = row.original;
					return (
						<>
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
							<span className="user-detail-role-current">{face.roleName}</span>
						</>
					);
				},
			},
			{
				id: 'status',
				header: () => t('pages.userDetail.faceColumnStatus'),
				cell: ({ row }) => {
					const face = row.original;
					const statusKey = getFaceStatusI18nKey(face);
					if (!statusKey) return '—';
					return (
						<span
							className={`user-detail-badge ${face.isFaceBanned ? 'user-detail-badge--danger' : 'user-detail-badge--ok'}`}
						>
							{t(statusKey)}
						</span>
					);
				},
			},
			{
				id: 'actions',
				header: () => t('common.actions'),
				enableSorting: false,
				cell: ({ row }) => {
					const face = row.original;
					if (face.isFaceBanned) {
						return (
							<Button
								variant="outline"
								onClick={() => onFaceUnban(face.faceId)}
								disabled={faceUnbanPending}
							>
								{t('pages.userDetail.faceUnban')}
							</Button>
						);
					}
					return (
						<div className="user-detail-face-ban-actions">
							<textarea
								className="user-detail-textarea user-detail-textarea--compact"
								value={faceBanReasonById[face.faceId] ?? ''}
								onChange={(e) =>
									setFaceBanReasonById((prev) => ({
										...prev,
										[face.faceId]: e.target.value,
									}))
								}
								placeholder={t('pages.userDetail.banReasonHint')}
								rows={2}
							/>
							<Button
								variant="outline"
								onClick={() => onFaceBan(face.faceId)}
								disabled={faceBanPending || !canSubmitFaceBan(faceBanReasonById[face.faceId])}
							>
								{t('pages.userDetail.faceBan')}
							</Button>
						</div>
					);
				},
			},
		],
		[
			faceBanPending,
			faceBanReasonById,
			faceRoles,
			faceUnbanPending,
			onFaceBan,
			onFaceUnban,
			onRoleChange,
			roleChangePending,
			setFaceBanReasonById,
			t,
		]
	);

	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table; local render only
	const table = useReactTable({
		data: faces,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getRowId: (row) => String(row.faceId),
	});

	return (
		<div className="user-detail-faces-table-wrapper">
			<Table variant="surface" size="2" className="user-detail-faces-table">
				<TableHeader>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map((header) => (
								<TableHeaderCell key={header.id}>
									{header.isPlaceholder
										? null
										: flexRender(header.column.columnDef.header, header.getContext())}
								</TableHeaderCell>
							))}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{table.getRowModel().rows.length === 0 ? (
						<TableRow>
							<TableCell colSpan={columns.length} style={{ textAlign: 'center', padding: '2rem' }}>
								{t('pages.userDetail.noFaces')}
							</TableCell>
						</TableRow>
					) : (
						table.getRowModel().rows.map((row) => (
							<TableRow key={row.id}>
								{row.getVisibleCells().map((cell) => (
									<TableCell key={cell.id}>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</TableCell>
								))}
							</TableRow>
						))
					)}
				</TableBody>
			</Table>
		</div>
	);
}
