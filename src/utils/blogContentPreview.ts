/**
 * Client-side fallback when API omits contentPlainText; keep aligned with BE ContentModerationPreviewText.
 */
export function stripHtmlForOperatorPreview(html: string): string {
	if (!html?.trim()) return '';
	const withoutTags = html.replace(/<[^>]+>/g, ' ');
	const decoded = withoutTags
		.replace(/&nbsp;/gi, ' ')
		.replace(/&amp;/gi, '&')
		.replace(/&lt;/gi, '<')
		.replace(/&gt;/gi, '>')
		.replace(/&quot;/gi, '"')
		.replace(/&#39;/gi, "'");
	return decoded.replace(/\s+/g, ' ').trim();
}

export function resolveBlogBodyPlainText(
	contentPlainText: string | null | undefined,
	rawContent: string | null | undefined
): string {
	if (contentPlainText?.trim()) return contentPlainText.trim();
	return stripHtmlForOperatorPreview(rawContent ?? '');
}
