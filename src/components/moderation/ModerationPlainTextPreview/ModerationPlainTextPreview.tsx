/**
 * SHV2 PI-8: renders untrusted moderation fields as plain text only (no HTML interpretation).
 */
import type { ModerationPlainTextPreviewProps } from '../types';

export function ModerationPlainTextPreview({
	label,
	value,
	className = 'content-moderation-page__plain-preview',
}: ModerationPlainTextPreviewProps) {
	return (
		<div className={className}>
			{label ? <h4>{label}</h4> : null}
			<pre className="content-moderation-page__plain-preview-text">{value}</pre>
		</div>
	);
}
