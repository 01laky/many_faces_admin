/** Next preview index; wraps from last item to 0. */
export function getNextIndex(current: number, count: number): number {
	if (count <= 0) return 0;
	return (current + 1) % count;
}

/** Previous preview index; wraps from 0 to last. */
export function getPrevIndex(current: number, count: number): number {
	if (count <= 0) return 0;
	return (current - 1 + count) % count;
}
