import { sanitizeHttpsUrl } from './safeUrl';

/** Max length for operator-editable grid metadata strings (ASH1-D6). */
export const GRID_SCHEMA_TEXT_MAX = 256;

export interface GridSchemaItemLike {
	title?: string | null;
	icon?: string | null;
	boundUrl?: string | null;
	boundAlbumId?: number | null;
	[key: string]: unknown;
}

export interface GridSchemaLike {
	schemaVersion?: number;
	items?: GridSchemaItemLike[];
	[key: string]: unknown;
}

/** Strip control chars, angle-bracket tags, and cap length — never interpret as HTML. */
export function sanitizeGridTextField(
	value: string | null | undefined,
	maxLen = GRID_SCHEMA_TEXT_MAX
): string {
	if (value == null) return '';
	const noTags = value.replace(/<[^>]*>/g, '');
	const noControls = [...noTags]
		.filter((ch) => {
			const code = ch.charCodeAt(0);
			return code >= 32 && code !== 127;
		})
		.join('')
		.trim();
	return noControls.length > maxLen ? noControls.slice(0, maxLen) : noControls;
}

/** Sanitize grid schema text/url fields before persisting to API. */
export function sanitizeGridSchemaForSave<T extends GridSchemaLike>(schema: T): T {
	if (!schema?.items?.length) return schema;

	return {
		...schema,
		items: schema.items.map((item) => {
			const next: GridSchemaItemLike = { ...item };
			if (typeof next.title === 'string') next.title = sanitizeGridTextField(next.title);
			if (typeof next.icon === 'string') next.icon = sanitizeGridTextField(next.icon, 64);
			if (typeof next.boundUrl === 'string') {
				const safe = sanitizeHttpsUrl(next.boundUrl);
				next.boundUrl = safe || undefined;
			}
			return next;
		}),
	};
}
