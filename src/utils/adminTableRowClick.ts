import type { KeyboardEvent, MouseEvent } from 'react';

/** Prevents a row-level detail navigation handler from firing (links, buttons). */
export function stopAdminTableRowNavigation(event: MouseEvent | KeyboardEvent) {
	event.stopPropagation();
}

export function handleAdminTableRowKeyDown(
	event: KeyboardEvent<HTMLTableRowElement>,
	onActivate: () => void
) {
	if (event.key === 'Enter' || event.key === ' ') {
		event.preventDefault();
		onActivate();
	}
}
