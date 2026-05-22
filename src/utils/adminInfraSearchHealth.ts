import type { SearchHealthDto } from '@/api/models/SearchHealthDto';

export type SearchHealthUiState = 'disabled' | 'unreachable' | 'healthy';

/** Maps backend search health DTO to Settings panel badge state. */
export function resolveSearchHealthUiState(dto: SearchHealthDto | undefined): SearchHealthUiState {
	if (!dto?.configured) return 'disabled';
	if (!dto.reachable) return 'unreachable';
	return 'healthy';
}
