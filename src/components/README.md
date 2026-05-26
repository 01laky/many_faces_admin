# Admin components layout

**List tables & detail pages:** [`docs/guides/admin-ui-list-and-detail-pages.md`](../../../docs/guides/admin-ui-list-and-detail-pages.md) — use `FaceDetailEntityTableShell` and `user-detail-*` operator layout; see [`AGENTS.md`](../../AGENTS.md).

Each UI block lives in its own folder next to its styles and barrel export.

## Convention

| Area                          | Path pattern                                                                                                          |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Shell components              | `src/components/<Name>/<Name>.tsx` + optional SCSS + `index.ts`                                                       |
| Admin tables                  | `src/components/tables/<Name>/…`                                                                                      |
| Dashboard widgets             | `src/components/dashboard/<Name>/…`                                                                                   |
| Page editor                   | `src/components/page-editor/<Name>/…`                                                                                 |
| Radix wrappers                | `src/components/radix/<Name>/…` (+ `radix/index.ts` vendor re-exports)                                                |
| Pages                         | `src/pages/<Name>/<Name>.tsx` + optional SCSS + `index.ts`                                                            |
| Shared form SCSS              | `src/styles/forms/*.scss`                                                                                             |
| Split files (types/constants) | `types.ts`, `constants.ts`, optional `enums.ts` / `schemas.ts` beside each module entry — see types-colocation prompt |

## New component

```text
src/components/<Name>/<Name>.tsx
src/components/<Name>/<Name>.scss
src/components/<Name>/index.ts   → export { Name } from './Name'
src/components/<Name>/types.ts   → Props / local types (when present)
src/components/<Name>/constants.ts → module-level literals (when present)
```

Import from outside via the folder barrel: `import { Name } from '@/components/Name'` (or relative `../components/Name`).

Prefer `@/` for imports from `src/` layers (`@/hooks/…`, `@/contexts/…`) in `pages/`, `components/`, and `routes/`.

## Verification

From monorepo root:

```bash
node scripts/verify-admin-component-colocation.mjs
node scripts/verify-admin-component-colocation.mjs --imports
node scripts/audit-admin-inline-symbols.mjs --summary
node scripts/verify-admin-types-enums-constants-colocation.mjs [--warn-only]
node scripts/verify-admin-types-colocation-tests.mjs
```

Helper for a single move:

```bash
node scripts/colocate-admin-component.mjs Header [--dry-run]
node scripts/colocate-admin-component.mjs DashboardCharts --dashboard
node scripts/colocate-admin-component.mjs GridLayoutEditor --page-editor
```

Bulk phase moves:

```bash
node scripts/migrate-admin-colocate-phase.mjs radix
node scripts/fix-admin-colocated-relative-paths.mjs
```

Spec: `docs/prompts/fe-admin-component-folder-colocation-agent-prompt.md`

Types/constants split: `docs/prompts/fe-admin-types-enums-constants-colocation-agent-prompt.md`
