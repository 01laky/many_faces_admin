import type { ReactNode } from 'react';

const EM_OPEN = '<em>';
const EM_CLOSE = '</em>';

/** Allowlist-only highlight renderer — strips tags except `<em>` (GSH1-T-U11). */
export function renderSafeSearchHighlight(html: string): ReactNode {
	if (!html) return null;

	const parts: ReactNode[] = [];
	let remaining = html;
	let key = 0;

	while (remaining.length > 0) {
		const openIdx = remaining.toLowerCase().indexOf(EM_OPEN);
		if (openIdx === -1) {
			parts.push(stripUnsafeMarkup(remaining));
			break;
		}

		if (openIdx > 0) {
			parts.push(stripUnsafeMarkup(remaining.slice(0, openIdx)));
		}

		const afterOpen = remaining.slice(openIdx + EM_OPEN.length);
		const closeIdx = afterOpen.toLowerCase().indexOf(EM_CLOSE);
		if (closeIdx === -1) {
			parts.push(stripUnsafeMarkup(afterOpen));
			break;
		}

		const inner = afterOpen.slice(0, closeIdx);
		parts.push(<em key={key++}>{stripUnsafeMarkup(inner)}</em>);
		remaining = afterOpen.slice(closeIdx + EM_CLOSE.length);
	}

	return parts.length === 1 ? parts[0] : parts;
}

function stripUnsafeMarkup(value: string): string {
	return value.replace(/<[^>]*>/g, '');
}

/** Picks the first highlight or falls back to plain title. */
export function pickSearchHighlightLabel(hit: { title: string; highlights?: string[] }): {
	text: string;
	isHtml: boolean;
} {
	const highlight = hit.highlights?.[0];
	if (highlight) return { text: highlight, isHtml: true };
	return { text: hit.title, isHtml: false };
}

export function adminSearchEntityTypeKey(entityType: string): string {
	return `globalSearch.entityType.${entityType}`;
}
