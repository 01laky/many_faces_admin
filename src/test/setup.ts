import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup after each test
afterEach(() => {
	cleanup();
});

// Mock i18n
vi.mock('../i18n/config', () => ({
	default: {
		t: (key: string) => key,
		changeLanguage: vi.fn(),
	},
}));

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual('react-router-dom');
	return {
		...actual,
		useNavigate: () => vi.fn(),
		useParams: () => ({}),
		useLocation: () => ({ pathname: '/', search: '', hash: '', state: null }),
	};
});

// Mock react-i18next
vi.mock('react-i18next', () => ({
	useTranslation: () => ({
		t: (key: string) => key,
		i18n: {
			changeLanguage: vi.fn(),
			language: 'en',
		},
	}),
}));

// Mock react-toastify
vi.mock('react-toastify', () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
		info: vi.fn(),
		warning: vi.fn(),
	},
	ToastContainer: () => null,
}));

// Mock logger
vi.mock('../utils/logger', () => ({
	logger: {
		info: vi.fn(),
		error: vi.fn(),
		warn: vi.fn(),
		debug: vi.fn(),
	},
}));
