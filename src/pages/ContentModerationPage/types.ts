import type { Dispatch, SetStateAction } from 'react';
import type {
	ModerationEvent,
	ModerationItem,
	ModerationMetrics,
} from '@/hooks/api/useContentModerationApi';
import type {
	AiReviewRiskLevel,
	AiReviewStatus,
	BulkModerationAction,
	ContentApprovalStatus,
	ModeratedContentType,
} from '@/utils/contentModeration';
import type { ColumnDef, PaginationState, SortingState } from '@tanstack/react-table';

export interface ModerationFilterState {
	contentType: ModeratedContentType | '';
	approvalStatus: ContentApprovalStatus | '';
	aiReviewStatus: AiReviewStatus | '';
	riskLevel: AiReviewRiskLevel | '';
	authorId: string;
	faceIdText: string;
	moderationVersionText: string;
	flagContains: string;
	minConfidenceText: string;
	maxConfidenceText: string;
	submittedFromUtc: string;
	submittedToUtc: string;
	reviewedByUserId: string;
	minQueueAgeHoursText: string;
}

/**
 * Setter half of the filter props, derived from `ModerationFilterState` by key remapping:
 * `contentType` -> `setContentType`, and so on. Without the `set${Capitalize<K>}` remap the two
 * halves collide on every key (a value and a function under one name), which is what made
 * `ModerationFiltersProps` unusable. `ModerationFilters` only ever calls these with a concrete
 * value, so a plain `(value: T) => void` is the right contract — a React `Dispatch<SetStateAction<T>>`
 * from the page is assignable to it, but callers cannot pass a functional updater the component
 * would not support.
 */
export type ModerationFilterSetters = {
	[K in keyof ModerationFilterState as `set${Capitalize<K>}`]: (
		value: ModerationFilterState[K]
	) => void;
};

export interface ModerationFiltersProps extends ModerationFilterState, ModerationFilterSetters {}

/** Event timeline rows returned from the moderation events query. */
export type ModerationEvents = ModerationEvent[];

export interface ModerationItemDrawerProps {
	item: ModerationItem;
	events: ModerationEvents | undefined;
	eventsLoading: boolean;
	onClose: () => void;
}

export interface ModerationMetricsBreakdownTableProps<T> {
	rows: T[];
	columns: ColumnDef<T, unknown>[];
	getRowId: (row: T) => string;
	className?: string;
}

/** Normalized moderation metrics payload consumed by dashboards and panels. */
export type MetricsData = ModerationMetrics;

export interface ModerationMetricsPanelProps {
	metrics: MetricsData | undefined;
}

export interface ModerationQueueTableProps {
	items: ModerationItem[];
	totalCount: number;
	totalPages: number;
	pagination: PaginationState;
	onPaginationChange: Dispatch<SetStateAction<PaginationState>>;
	sorting: SortingState;
	onSortingChange: Dispatch<SetStateAction<SortingState>>;
	isLoading: boolean;
	error: unknown;
	selectedKeys: string[];
	reasonByItem: Record<string, string>;
	bulkActionName: BulkModerationAction;
	bulkReason: string;
	bulkResultSummary: string | null;
	bulkActionPending: boolean;
	onReasonChange: (key: string, reason: string) => void;
	onToggleSelected: (item: ModerationItem) => void;
	onSelectItem: (item: ModerationItem) => void;
	onRunAction: (item: ModerationItem, actionName: 'approve' | 'reject' | 'remove') => void;
	onBulkActionNameChange: (action: BulkModerationAction) => void;
	onBulkReasonChange: (reason: string) => void;
	onRunBulkAction: () => void;
}
