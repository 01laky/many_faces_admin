import { describe, expect, it, vi, beforeEach } from 'vitest';

// Mock the generated request layer so we can assert on the HTTP method + URL without a backend.
const requestMock = vi.fn();
vi.mock('../../core/request', () => ({
	request: (...args: unknown[]) => requestMock(...args),
}));

import {
	getOperatorAiKnowledgeStatus,
	reindexOperatorAiKnowledge,
	OPERATOR_AI_KNOWLEDGE_EXPECTED_DOC_COUNT,
} from '../operatorAiKnowledgeApi';

describe('operatorAiKnowledgeApi', () => {
	beforeEach(() => {
		requestMock.mockReset();
	});

	it('reindex POSTs to the knowledge reindex endpoint', async () => {
		requestMock.mockResolvedValue({
			indexedCount: 61,
			failedCount: 0,
			embedModelVersion: 'nomic-embed-text',
		});
		const result = await reindexOperatorAiKnowledge('tok');
		const opts = requestMock.mock.calls[0][1] as { method: string; url: string };
		expect(opts.method).toBe('POST');
		expect(opts.url).toBe('/admin/api/operator-ai/knowledge/reindex');
		expect(result.indexedCount).toBe(61);
	});

	it('status GETs from the knowledge status endpoint', async () => {
		requestMock.mockResolvedValue({
			alias: 'operator-ai-knowledge',
			activeIndex: 'operator-ai-knowledge-v1',
			docCount: 61,
			expectedDocCount: 61,
			embedModelVersion: 'nomic-embed-text',
			vectorDim: 768,
			ready: true,
			degraded: false,
		});
		await getOperatorAiKnowledgeStatus('tok');
		const opts = requestMock.mock.calls[0][1] as { method: string; url: string };
		expect(opts.method).toBe('GET');
		expect(opts.url).toBe('/admin/api/operator-ai/knowledge/status');
	});

	it('exposes the expected doc count for the 61 fixed bundles', () => {
		expect(OPERATOR_AI_KNOWLEDGE_EXPECTED_DOC_COUNT).toBe(61);
	});
});
