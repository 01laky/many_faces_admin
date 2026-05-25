/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AdminDashboardSummaryDto } from '../models/AdminDashboardSummaryDto';
import type { PublicStatsSnapshotDto } from '../models/PublicStatsSnapshotDto';
import type { StatsTimeseriesResponseDto } from '../models/StatsTimeseriesResponseDto';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class StatsService {
	/**
	 * @returns AdminDashboardSummaryDto OK
	 * @throws ApiError
	 */
	public static getApiStats(): CancelablePromise<AdminDashboardSummaryDto> {
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/Stats',
		});
	}
	/**
	 * @returns PublicStatsSnapshotDto OK
	 * @throws ApiError
	 */
	public static getApiStatsPublic(): CancelablePromise<PublicStatsSnapshotDto> {
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/Stats/public',
		});
	}
	/**
	 * @returns StatsTimeseriesResponseDto OK
	 * @throws ApiError
	 */
	public static getApiStatsTimeseries({
		metric,
		fromUtc,
		toUtc,
		bucket,
	}: {
		metric?: string;
		fromUtc?: string;
		toUtc?: string;
		bucket?: string;
	}): CancelablePromise<StatsTimeseriesResponseDto> {
		return __request(OpenAPI, {
			method: 'GET',
			url: '/api/Stats/timeseries',
			query: {
				Metric: metric,
				FromUtc: fromUtc,
				ToUtc: toUtc,
				Bucket: bucket,
			},
		});
	}
}
