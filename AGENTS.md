# Agent notes — `many_faces_admin`

When working on **list tables** or **detail pages** in this app:

1. Read **[`docs/guides/admin-ui-list-and-detail-pages.md`](../docs/guides/admin-ui-list-and-detail-pages.md)** (templates, references, checklist).
2. Cursor rule **`.cursor/rules/admin-ui-list-detail-pages.mdc`** applies to `src/pages/**`, `src/components/tables/**`, and `AdminReadOnlyDetailLayout`.
3. Paste the mandatory header from **[`docs/prompts/admin-ui-list-detail-pages-agent-prompt.md`](../docs/prompts/admin-ui-list-detail-pages-agent-prompt.md)** at the start of agent tasks.

**Component folders:** [`.cursor/rules/admin-component-folders.mdc`](../.cursor/rules/admin-component-folders.mdc) · verify: `node scripts/verify-admin-component-colocation.mjs`

**Validate:** `yarn validate` · `yarn test`
