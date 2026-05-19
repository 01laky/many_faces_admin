import { describe, expect, it, vi } from 'vitest';
import { handleAdminTableRowKeyDown, stopAdminTableRowNavigation } from '../adminTableRowClick';

describe('adminTableRowClick', () => {
	it('stopAdminTableRowNavigation stops propagation', () => {
		const stopPropagation = vi.fn();
		stopAdminTableRowNavigation({ stopPropagation } as unknown as React.MouseEvent);
		expect(stopPropagation).toHaveBeenCalled();
	});

	it('handleAdminTableRowKeyDown activates on Enter', () => {
		const onActivate = vi.fn();
		const preventDefault = vi.fn();
		handleAdminTableRowKeyDown(
			{ key: 'Enter', preventDefault } as unknown as React.KeyboardEvent<HTMLTableRowElement>,
			onActivate
		);
		expect(preventDefault).toHaveBeenCalled();
		expect(onActivate).toHaveBeenCalled();
	});

	it('handleAdminTableRowKeyDown ignores other keys', () => {
		const onActivate = vi.fn();
		handleAdminTableRowKeyDown(
			{
				key: 'Tab',
				preventDefault: vi.fn(),
			} as unknown as React.KeyboardEvent<HTMLTableRowElement>,
			onActivate
		);
		expect(onActivate).not.toHaveBeenCalled();
	});
});
