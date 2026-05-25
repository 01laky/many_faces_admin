/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BulkModerationAction } from './BulkModerationAction';
import type { BulkModerationItemDto } from './BulkModerationItemDto';
export type BulkModerationRequest = {
	action?: BulkModerationAction;
	items?: Array<BulkModerationItemDto> | null;
	reason?: string | null;
	userMessage?: string | null;
};
