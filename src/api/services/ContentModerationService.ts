/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AiReviewRiskLevel } from '../models/AiReviewRiskLevel';
import type { AiReviewStatus } from '../models/AiReviewStatus';
import type { BulkModerationRequest } from '../models/BulkModerationRequest';
import type { ContentApprovalStatus } from '../models/ContentApprovalStatus';
import type { ModeratedContentType } from '../models/ModeratedContentType';
import type { ModerationDecisionDto } from '../models/ModerationDecisionDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ContentModerationService {
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getApiContentModeration({
		contentType,
		approvalStatus,
		aiReviewStatus,
		faceId,
		authorId,
		riskLevel,
		moderationVersion,
		flagContains,
		minConfidence,
		maxConfidence,
		submittedFromUtc,
		submittedToUtc,
		reviewedByUserId,
		minQueueAgeHours,
	}: {
		contentType?: ModeratedContentType;
		approvalStatus?: ContentApprovalStatus;
		aiReviewStatus?: AiReviewStatus;
		faceId?: number;
		authorId?: string;
		riskLevel?: AiReviewRiskLevel;
		moderationVersion?: number;
		flagContains?: string;
		minConfidence?: number;
		maxConfidence?: number;
		submittedFromUtc?: string;
		submittedToUtc?: string;
		reviewedByUserId?: string;
		minQueueAgeHours?: number;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/ContentModeration',
			query: {
				ContentType: contentType,
				ApprovalStatus: approvalStatus,
				AiReviewStatus: aiReviewStatus,
				FaceId: faceId,
				AuthorId: authorId,
				RiskLevel: riskLevel,
				ModerationVersion: moderationVersion,
				FlagContains: flagContains,
				MinConfidence: minConfidence,
				MaxConfidence: maxConfidence,
				SubmittedFromUtc: submittedFromUtc,
				SubmittedToUtc: submittedToUtc,
				ReviewedByUserId: reviewedByUserId,
				MinQueueAgeHours: minQueueAgeHours,
			},
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getApiContentModerationEvents({
		contentType,
		contentId,
	}: {
		contentType: ModeratedContentType;
		contentId: number;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/ContentModeration/{contentType}/{contentId}/events',
			path: {
				contentType: contentType,
				contentId: contentId,
			},
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getApiContentModerationMetrics(): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/ContentModeration/metrics',
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postApiContentModerationBulk({
		requestBody,
	}: {
		requestBody?: BulkModerationRequest;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/ContentModeration/bulk',
			body: requestBody,
			mediaType: 'application/json',
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postApiContentModerationApprove({
		contentType,
		contentId,
		requestBody,
	}: {
		contentType: ModeratedContentType;
		contentId: number;
		requestBody?: ModerationDecisionDto;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/ContentModeration/{contentType}/{contentId}/approve',
			path: {
				contentType: contentType,
				contentId: contentId,
			},
			body: requestBody,
			mediaType: 'application/json',
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postApiContentModerationReject({
		contentType,
		contentId,
		requestBody,
	}: {
		contentType: ModeratedContentType;
		contentId: number;
		requestBody?: ModerationDecisionDto;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/ContentModeration/{contentType}/{contentId}/reject',
			path: {
				contentType: contentType,
				contentId: contentId,
			},
			body: requestBody,
			mediaType: 'application/json',
		});
	}
	/**
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postApiContentModerationRemove({
		contentType,
		contentId,
		requestBody,
	}: {
		contentType: ModeratedContentType;
		contentId: number;
		requestBody?: ModerationDecisionDto;
	}): CancelablePromise<any> {
		return __request(OpenAPI, {
			method: 'POST',
			url: '/api/ContentModeration/{contentType}/{contentId}/remove',
			path: {
				contentType: contentType,
				contentId: contentId,
			},
			body: requestBody,
			mediaType: 'application/json',
		});
	}
}
