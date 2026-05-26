import type { InfraLastTestOutcome } from '@/utils/adminInfraStatusStrip';
import type { AdminInfraWorkerConfigDto } from '@/api/models/AdminInfraWorkerConfigDto';
import type { SearchHealthDto } from '@/api/models/SearchHealthDto';
import type { OperatorAiWorkerHostDto } from '@/api/models/OperatorAiWorkerHostDto';

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
