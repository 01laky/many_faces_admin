import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from '@tanstack/react-table';
import type { AdminMeFaceRow } from '@/api/adminMeProfileApiClient';
import type { AdminProfileFacesTableProps } from './types';
import { Input } from '@/components/radix/Input';
import {
	Table,
	TableHeader,
	TableBody,
	TableRow,
	TableHeaderCell,
	TableCell,
} from '@/components/radix/Table';

const FACE_FILTER_THRESHOLD = 8;

/** Per-face role grid on admin self-profile (no ban/moderation controls). */
export function AdminProfileFacesTable({
	faces,
	faceRoles,
	onRoleChange,
	pendingFaceId,
	getLocalizedPath,
}: AdminProfileFacesTableProps) {
	const { t } = useTranslation('common');
	const [filter, setFilter] = useState('');

	const filteredFaces = useMemo(() => {
		const q = filter.trim().toLowerCase();
		if (!q) return faces;
		return faces.filter(
			(f) => f.faceTitle.toLowerCase().includes(q) || f.faceIndex.toLowerCase().includes(q)
		);
	}, [faces, filter]);

	const columns = useMemo<ColumnDef<AdminMeFaceRow>[]>(
		() => [
			{
				id: 'face',
				header: () => t('pages.adminProfile.faceColumnTitle'),
				cell: ({ row }) => (
					<>
						<strong>
							<Link to={getLocalizedPath(`/faces/${row.original.faceId}`)}>
								{row.original.faceTitle}
							</Link>
						</strong>
						<div className="user-detail-face-index">{row.original.faceIndex}</div>
					</>
				),
			},
			{
				id: 'role',
				header: () => t('pages.adminProfile.faceColumnRole'),
				cell: ({ row }) => {
					const face = row.original;
					const selectDisabled = pendingFaceId === face.faceId || faceRoles.length === 0;
					return (
						<select
							className="user-detail-role-select"
							value={face.userRoleId ?? ''}
							disabled={selectDisabled}
							onChange={(e) => {
								const raw = e.target.value;
								if (!raw) return;
								onRoleChange(face, Number(raw));
							}}
						>
							<option value="" disabled>
								{t('pages.adminProfile.selectFaceRole')}
							</option>
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
				cell: ({ row }) => {
					const face = row.original;
					let label: string;
					if (!face.hasMembership && face.userRoleId == null) {
						label = t('pages.adminProfile.notAssigned');
					} else if (face.isActiveParticipant) {
						label = t('pages.adminProfile.activeParticipant');
					} else {
						label = t('pages.adminProfile.hostOnly');
					}
					return <span className="user-detail-badge">{label}</span>;
				},
			},
		],
		[faceRoles, getLocalizedPath, onRoleChange, pendingFaceId, t]
	);

	const table = useReactTable({
		data: filteredFaces,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	const showFilter = faces.length > FACE_FILTER_THRESHOLD;

	return (
		<>
			<p className="admin-profile-faces-hint">{t('pages.adminProfile.facesSectionHint')}</p>
			{showFilter && (
				<div className="admin-profile-faces-filter">
					<Input
						type="search"
						value={filter}
						onChange={(e) => setFilter(e.target.value)}
						placeholder={t('pages.adminProfile.facesFilterPlaceholder')}
						aria-label={t('pages.adminProfile.facesFilterPlaceholder')}
					/>
				</div>
			)}
			{faces.length === 0 ? (
				<p className="admin-profile-empty-faces">{t('pages.adminProfile.noFacesInSystem')}</p>
			) : (
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
						{table.getRowModel().rows.length === 0 ? (
							<TableRow>
								<TableCell colSpan={columns.length}>
									<p className="admin-profile-empty-faces">
										{t('pages.adminProfile.facesFilterNoMatch')}
									</p>
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
			)}
		</>
	);
}
