import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
import type { AdminInfraWorkerConfigDto } from '../models/AdminInfraWorkerConfigDto';
import type { MailerTestSelfResultDto } from '../models/MailerTestSelfResultDto';
import type { PushTestSelfResultDto } from '../models/PushTestSelfResultDto';
import type { SearchHealthDto } from '../models/SearchHealthDto';

export async function getWorkerConfig(token: string): Promise<AdminInfraWorkerConfigDto> {
	OpenAPI.TOKEN = token;
	return __request(OpenAPI, {
		method: 'GET',
		url: '/api/admin/infra/worker-config',
	});
}

export async function postMailerTestSelf(token: string): Promise<MailerTestSelfResultDto> {
	OpenAPI.TOKEN = token;
	return __request(OpenAPI, {
		method: 'POST',
		url: '/api/admin/mailer/test-self',
	});
}

export async function postPushTestSelf(token: string): Promise<PushTestSelfResultDto> {
	OpenAPI.TOKEN = token;
	return __request(OpenAPI, {
		method: 'POST',
		url: '/api/admin/push/test-self',
	});
}

export async function getSearchHealth(token: string): Promise<SearchHealthDto> {
	OpenAPI.TOKEN = token;
	return __request(OpenAPI, {
		method: 'GET',
		url: '/api/search/health',
	});
}
