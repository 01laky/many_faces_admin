import type { InfraLastTestOutcome } from '@/utils/adminInfraStatusStrip';
import type { AdminInfraWorkerConfigDto } from '@/api/models/AdminInfraWorkerConfigDto';
import type { SearchHealthDto } from '@/api/models/SearchHealthDto';
import type { OperatorAiWorkerHostDto } from '@/api/models/OperatorAiWorkerHostDto';
import type {
	OperatorAiKnowledgeReindexResult,
	OperatorAiKnowledgeStatus,
} from '@/api/services/operatorAiKnowledgeApi';

export type InfraDevLinkItem = {
	href: string;
	labelKey: string;
	external?: boolean;
};

export type InfraDevQuickLinksProps = {
	links: InfraDevLinkItem[];
};

export type InfraStatusStripProps = {
	configured?: boolean | undefined;
	/** When set, uses pages.settings.infra.*.config.status.* badges (AMC-U5 / APC-U5). */
	effectiveStatus?: string;
	effectiveStatusNamespace?: 'mail' | 'push';
	deviceCount?: number;
	lastTest?: InfraLastTestOutcome;
	updatedAtUtc?: string;
};

export type MailerConfigPanelProps = {
	workerConfig?: AdminInfraWorkerConfigDto;
	configLoading?: boolean;
};

export type MailerSmokePanelProps = {
	workerConfig?: AdminInfraWorkerConfigDto;
	configLoading?: boolean;
};

export type PushConfigPanelProps = {
	workerConfig?: AdminInfraWorkerConfigDto;
	configLoading?: boolean;
};

export type PushSmokePanelProps = {
	workerConfig?: AdminInfraWorkerConfigDto;
	configLoading?: boolean;
};

export type SearchHealthPanelProps = {
	data?: SearchHealthDto;
	isLoading?: boolean;
	isError?: boolean;
	onRefresh?: () => void;
	refreshPending?: boolean;
};

export type AiWorkerHostPanelProps = {
	data?: OperatorAiWorkerHostDto;
	isLoading?: boolean;
	isError?: boolean;
};

/** Read-only knowledge-index health panel (§17.9). */
export type KnowledgeIndexStatusPanelProps = {
	/** Disable the status query (e.g. when AI is globally off). */
	enabled?: boolean;
};

/** Presentational props for the knowledge-index status body (no data fetching). */
export type KnowledgeIndexStatusPanelBodyProps = {
	data?: OperatorAiKnowledgeStatus;
	isLoading?: boolean;
	isError?: boolean;
};

/** Reindex-knowledge control (§8.1). */
export type KnowledgeReindexPanelProps = {
	/** Disable the control (e.g. sub-settings locked while AI is off / loading). */
	disabled?: boolean;
	/** Whether AI is globally enabled — gates the embedded status panel query. */
	aiEnabled?: boolean;
};

/** Presentational props for the reindex-knowledge body (no data fetching). */
export type KnowledgeReindexPanelBodyProps = {
	onReindex: () => void;
	isRunning?: boolean;
	disabled?: boolean;
	result?: OperatorAiKnowledgeReindexResult | null;
	error?: boolean;
	alreadyRunning?: boolean;
};
