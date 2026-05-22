// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SearchHealthPanelBody } from '../SearchHealthPanel';

vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => {
			if (key.endsWith('.healthy')) return 'Healthy';
			if (key.endsWith('.disabled')) return 'Disabled';
			if (key.endsWith('.unreachable')) return 'Unreachable';
			return key;
		},
	}),
}));

describe('SearchHealthPanelBody', () => {
	it('shows Healthy badge when configured and reachable', () => {
		render(
			<SearchHealthPanelBody
				data={{ configured: true, reachable: true, clusterName: 'docker-cluster' }}
			/>
		);
		expect(screen.getByText('Healthy')).toBeTruthy();
		expect(screen.getByText('docker-cluster')).toBeTruthy();
	});
});
