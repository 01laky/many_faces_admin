import { useMemo } from 'react';
import { Alert, Button, Card, Col, Form, Row, Spinner } from 'react-bootstrap';
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from '@tanstack/react-table';
import type { ModerationItem } from '@/hooks/api/useContentModerationApi';
import {
	Table,
	TableHeader,
	TableBody,
	TableRow,
	TableHeaderCell,
	TableCell,
} from '@/components/radix/Table';
import {
	buildModerationRowKey,
	canRunBulkModeration,
	getModerationQueueLabel,
	parseModerationFlags,
	type BulkModerationAction,
} from '@/utils/contentModeration';
import { AdminTablePagination } from '@/components/tables/AdminTablePagination';

import type { ModerationQueueTableProps } from './types';

const COLUMN_COUNT = 10;

/**
 * SUPER_ADMIN moderation queue: bulk toolbar + TanStack Table over server-filtered items.
 * Selection and mutations stay in the parent page; this component owns presentation only.
 */
export function ModerationQueueTable({
	items,
	totalCount,
	totalPages,
	pagination,
	onPaginationChange,
	sorting,
	onSortingChange,
	isLoading,
	error,
	selectedKeys,
	reasonByItem,
	bulkActionName,
	bulkReason,
	bulkResultSummary,
	bulkActionPending,
	onReasonChange,
	onToggleSelected,
	onSelectItem,
	onRunAction,
	onBulkActionNameChange,
	onBulkReasonChange,
	onRunBulkAction,
}: ModerationQueueTableProps) {
	const rows = items;

	const columns = useMemo<ColumnDef<ModerationItem>[]>(
		() => [
			{
				id: 'select',
				header: 'Select',
				enableSorting: false,
				cell: ({ row }) => {
					const item = row.original;
					const key = buildModerationRowKey(item);
					return (
						<Form.Check
							aria-label={`Select ${item.contentType} ${item.contentId}`}
							checked={selectedKeys.includes(key)}
							onChange={() => onToggleSelected(item)}
						/>
					);
				},
			},
			{
				accessorKey: 'contentType',
				header: 'Type',
				enableSorting: true,
				cell: (info) => String(info.getValue()),
			},
			{
				accessorKey: 'title',
				header: 'Title',
				enableSorting: true,
				// PI-8: plain text only — never render queue fields as HTML.
				cell: (info) => String(info.getValue() ?? ''),
			},
			{
				id: 'face',
				header: 'Face',
				cell: ({ row }) => row.original.faceTitle || String(row.original.faceId),
			},
			{
				id: 'author',
				header: 'Author',
				cell: ({ row }) => row.original.creatorName.trim() || row.original.creatorId,
			},
			{
				id: 'status',
				header: 'Status',
				cell: ({ row }) =>
					getModerationQueueLabel(row.original.approvalStatus, row.original.aiReviewStatus),
			},
			{
				id: 'ai',
				header: 'AI',
				cell: ({ row }) => {
					const item = row.original;
					const flags = parseModerationFlags(item.aiReviewFlagsJson);
					const confidence =
						item.aiReviewConfidence != null
							? ` (${Math.round(item.aiReviewConfidence * 100)}%)`
							: '';
					const flagSuffix = flags.length > 0 ? ` - ${flags.join(', ')}` : '';
					return `${item.aiReviewStatus}${confidence}${flagSuffix}`;
				},
			},
			{
				id: 'reason',
				header: 'Reason',
				enableSorting: false,
				cell: ({ row }) => {
					const key = buildModerationRowKey(row.original);
					return (
						<Form.Control
							size="sm"
							value={reasonByItem[key] ?? ''}
							placeholder="Required for reject/remove and overrides"
							onChange={(event) => onReasonChange(key, event.target.value)}
						/>
					);
				},
			},
			{
				id: 'actions',
				header: 'Actions',
				enableSorting: false,
				cell: ({ row }) => {
					const item = row.original;
					return (
						<div className="content-moderation-page__actions">
							<Button size="sm" variant="outline-secondary" onClick={() => onSelectItem(item)}>
								Details
							</Button>
							<Button size="sm" variant="success" onClick={() => onRunAction(item, 'approve')}>
								Approve
							</Button>
							<Button size="sm" variant="warning" onClick={() => onRunAction(item, 'reject')}>
								Reject
							</Button>
							<Button size="sm" variant="danger" onClick={() => onRunAction(item, 'remove')}>
								Remove
							</Button>
						</div>
					);
				},
			},
		],
		[selectedKeys, reasonByItem, onToggleSelected, onReasonChange, onSelectItem, onRunAction]
	);

	/*
	 * TanStack Table returns unstable function identities; React Compiler flags useReactTable.
	 * We only consume `table` in this file's JSX (no memoized children), matching other admin tables.
	 */
	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table; local render only
	const table = useReactTable({
		data: rows,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getRowId: (row) => buildModerationRowKey(row),
		enableMultiSort: false,
		state: { pagination, sorting },
		onPaginationChange,
		onSortingChange,
		manualPagination: true,
		manualSorting: true,
		pageCount: totalPages,
	});

	const bulkEnabled = canRunBulkModeration(selectedKeys.length, bulkActionPending);

	return (
		<>
			<Card
				className="content-moderation-page__bulk shadow-sm"
				aria-label="Bulk moderation controls"
			>
				<Card.Body>
					<Form
						onSubmit={(e) => {
							e.preventDefault();
							onRunBulkAction();
						}}
					>
						<Row className="g-3 align-items-end">
							<Col xs={12} md="auto">
								<p className="mb-0 fw-semibold">{selectedKeys.length} selected</p>
							</Col>
							<Col xs={12} sm={6} md={3} lg={2}>
								<Form.Group controlId="moderation-bulk-action">
									<Form.Label>Bulk action</Form.Label>
									<Form.Select
										value={bulkActionName}
										onChange={(event) =>
											onBulkActionNameChange(event.target.value as BulkModerationAction)
										}
									>
										<option value="Approve">Approve</option>
										<option value="Reject">Reject</option>
										<option value="Remove">Remove</option>
										<option value="RequeueAiReview">Requeue AI review</option>
									</Form.Select>
								</Form.Group>
							</Col>
							<Col xs={12} md>
								<Form.Group controlId="moderation-bulk-reason">
									<Form.Label>Shared reason</Form.Label>
									<Form.Control
										placeholder="Reason for reject, remove, or override"
										value={bulkReason}
										onChange={(event) => onBulkReasonChange(event.target.value)}
									/>
								</Form.Group>
							</Col>
							<Col xs={12} sm={6} md="auto">
								<Button type="submit" variant="primary" className="w-100" disabled={!bulkEnabled}>
									Apply bulk action
								</Button>
							</Col>
							{bulkResultSummary && (
								<Col xs={12}>
									<p className="mb-0 text-muted small">{bulkResultSummary}</p>
								</Col>
							)}
						</Row>
					</Form>
				</Card.Body>
			</Card>

			{isLoading && <Spinner animation="border" />}
			{error && <Alert variant="danger">Failed to load moderation queue.</Alert>}

			{!isLoading && !error && (
				<div className="table-responsive">
					<Table variant="surface" size="2" className="content-moderation-page__table">
						<TableHeader>
							{table.getHeaderGroups().map((headerGroup) => (
								<TableRow key={headerGroup.id}>
									{headerGroup.headers.map((header) => (
										<TableHeaderCell
											key={header.id}
											data-sortable={header.column.getCanSort() ? '' : undefined}
											onClick={header.column.getToggleSortingHandler()}
											style={{
												cursor: header.column.getCanSort() ? 'pointer' : 'default',
											}}
										>
											{header.isPlaceholder
												? null
												: flexRender(header.column.columnDef.header, header.getContext())}
											{header.column.getIsSorted() && (
												<span>{header.column.getIsSorted() === 'desc' ? ' ↓' : ' ↑'}</span>
											)}
										</TableHeaderCell>
									))}
								</TableRow>
							))}
						</TableHeader>
						<TableBody>
							{table.getRowModel().rows.length === 0 ? (
								<TableRow>
									<TableCell
										colSpan={COLUMN_COUNT}
										style={{ textAlign: 'center', padding: '2rem' }}
									>
										No moderation items match the selected filters.
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
					<AdminTablePagination
						table={table}
						totalItems={totalCount}
						itemLabel="items"
						className="content-moderation-page__pagination"
					/>
				</div>
			)}
		</>
	);
}
