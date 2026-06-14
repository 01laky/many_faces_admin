# Changelog

All notable changes to **`many_faces_admin`** are documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) — **version headings only, no dates**. SemVer: [`VERSION`](./VERSION).

### Release index

| Version       | Theme                                        |
| ------------- | -------------------------------------------- |
| [1.2.4](#124) | Fix admin i18n load on direct Vite :8082     |
| [1.2.3](#123) | formatBytes edge tests (test-gap fill)       |
| [1.2.2](#122) | Refactor pass: dedup, dead code, stable keys |
| [1.2.1](#121) | Bug-fix pass: chat header, cache wipe, JWT   |
| [1.2.0](#120) | Operator AI live token streaming in chat     |
| [1.1.0](#110) | Operator AI RAG retrieval: 3-control AI page |
| [1.0.5](#105) | Admin profile all-faces role grid            |
| [1.0.4](#104) | Colocation verify hardening + sibling Props  |
| [1.0.3](#103) | Types/constants colocation rollout           |
| [1.0.0](#100) | Push config panel                            |
| [0.8.0](#080) | Mail config, global search, ASH1, i18n       |
| [0.7.0](#070) | Operator consoles, TanStack, infra smoke     |
| [0.6.0](#060) | Platform DMs, server-driven tables           |
| [0.5.0](#050) | Operator AI chat and user detail             |
| [0.4.0](#040) | Stats dashboard, registration invites        |
| [0.3.0](#030) | Moderation queue, ACL                        |
| [0.2.0](#020) | Dashboard, wall tickets, face routing        |
| [0.1.0](#010) | Admin SPA foundation                         |

## [Unreleased]

### Added

### Changed

### Fixed

---

## [1.2.4]

### Fixed

- **Admin translations failed to load on the direct Vite dev server (`https://localhost:8082`).**
  `resolveApiUrl` listed `:8082` in `ADMIN_DEV_PROXY_PORTS`, so it returned the page's own origin as
  the API base. But `:8082` is the direct Vite dev server (`admin-demo-dev`, `8082:8081`) which has no
  `/api` reverse proxy — same-origin `GET /api/localization/admin` hit Vite and returned `index.html`,
  producing _"Could not load translations"_. Removed `:8082` from the proxy-port set so direct Vite on
  localhost falls back to `VITE_API_URL` (`https://localhost:8001`) and remote-host Vite is handled by
  the existing dedicated `:8082` branch (`host:8001`/`host:8000`). Only the nginx `admin-demo-proxy`
  ports (`:8090`/`:8091`), which genuinely serve `/api` same-origin, remain. Regression tests added.

---

## [1.2.3]

### Added

- Edge-case tests for the previously-untested `formatBytes` 1024-based size formatter (unit-test-gap-fill): nullish/non-finite → em dash, sub-kilobyte whole bytes, unit promotion at the 1024 boundary, the "one decimal below 10, none at/above 10" rule, MB/GB/TB scaling, and the TB cap.

---

## [1.2.2]

### Changed

- Extracted the sidebar nav order into `AdminLayout/adminNavItems.ts` (`buildBaseAdminNavItems`) so the SAP-U5 "profile immediately before settings" order is unit-tested against the real builder instead of a hand-mirrored copy.
- Deduplicated shared helpers: `adminMailEffectiveStatus`/`adminPushEffectiveStatus` now re-export a shared `adminEffectiveStatus`; `isAbsoluteHttpUri` moved to a shared `httpUri` util used by both the mail and push settings validators; the duplicated `formatCellValue` in the chat-room/video-lounge tables is now a shared `formatNullableCount` (honestly typed `number | null | undefined`).

### Fixed

- `GradientPicker` colour rows now use stable keys instead of array indices, so removing a middle colour no longer keeps the wrong `<input type="color">` mounted (serialization shape unchanged).
- `replaceOptimisticUserChatMessage` removes only the first matching optimistic row, so sending two identical messages in a row no longer makes the second one briefly disappear on the first echo.
- `mergeTimeseriesForMultiLineChart` fails fast when the two series labels collide or shadow `periodStartUtc` (which would have silently dropped a series).
- Operator AI message pagination prefers the server `oldestId` cursor (falling back to the first item id, id-0 safe) instead of relying on `items[0].id`.

### Removed

- Dead `EditUserPage` (and its lazy export): `/users/:id/edit` already redirects to the user detail page, where operator user management lives.

---

## [1.2.1]

### Fixed

- Operator AI chat history now renders the message timestamp and author again — `mapOperatorMessageToUi` had dropped `createdAt`/`authorEmail`/`responseLocale`, which `formatMessageHeader` reads.
- Logout / session expiry now also wipes the per-face operator content caches (`faceProfiles`, `faceChatRooms`, `faceVideoLounges`, `stories`, `reels`, `blogs`, `albums`) so a different operator session cannot read the previous one's tenant data from React Query (REQ-SECURITY-CACHE).
- "Open in moderation queue" on the album/blog/reel detail pages navigated to a non-existent `/content-moderation` route (hit the catch-all redirect) — corrected to `/moderation`, preserving the `contentType`/`contentId` filters.
- JWT decoding is base64url-safe in both `isTokenExpired` and `isSuperAdminFromToken`: a raw `atob` threw on tokens whose payload contains `-`/`_`, which could deny a genuine SUPER_ADMIN on the fast-path. The decode is unified in `jwtUtils.decodeJwtPayload`.
- `parseModerationRowKey` rejects a blank id (`"Album:"` previously parsed to a deceptively valid `contentId: 0`).
- `useConfirmModal` resolves `false` (not `true`) when a `confirmAction` rejects, so a failed action is no longer reported as confirmed.
- The shared `radix/Button` and the grid-editor remove button default to `type="button"`, so a button that omits `type` inside a `<form>` no longer submits it accidentally (intentional `type="submit"` callers are unaffected).
- Dev API URL scheme typo in `resolveApiUrl` (`http//host` → `http://host`).

---

## [1.2.0]

### Added

- live token streaming in the operator AI chat: the chat page subscribes to the new `OperatorAiMessageDelta` SignalR event and renders the assistant answer token-by-token in a transient bubble (with a blinking caret), then reconciles to the persisted message on `OperatorAiMessageAppended`. Falls back cleanly to the previous spinner-until-appended behaviour when no deltas arrive, and clears streaming buffers on conversation switch / delete / unmount.
- vitest coverage for streaming: deltas accumulate and render live, the final appended event clears the streaming buffer (no duplicate), the no-delta legacy path is unchanged, and deltas for one conversation never leak into another.

### Fixed

---

## [1.1.0]

**Operator AI RAG retrieval refactor (v1) — admin SPA slice.** Reshapes Settings → AI to exactly
three controls and removes the legacy stats-mode + response-locale UI from the operator chat. See
`docs/prompts/operator-ai-rag-retrieval-refactor-v1-agent-prompt.md` (§8.1, §9, §17.9, D10–D12).

### Added

- **Reindex knowledge** control on Settings → AI (`POST /admin/api/operator-ai/knowledge/reindex`):
  shows `{ indexedCount, failedCount, embedModelVersion }`, disables while running, and surfaces a
  distinct "already running" notice on HTTP 409 (single-flight lock, §17.5).
- **Knowledge-index status panel** (read-only, §17.9): `GET /admin/api/operator-ai/knowledge/status`
  → active index/alias, doc count vs 61, last-indexed UTC, embed model version, vector dim, and a
  ready / degraded / not-ready badge.
- Hand-written typed client `src/api/services/operatorAiKnowledgeApi.ts` + hooks
  `src/hooks/api/useOperatorAiKnowledgeApi.ts` for the two new endpoints (not yet in the generated
  OpenAPI client; shapes mirror the spec §5.2/§8.1).
- Vitest coverage: settings page renders the three controls + status panel and no longer renders the
  stats-mode selector; reindex panel (result + 409 + error); status panel (fields + degraded/not-ready);
  the chat send invokes the hub with only `(conversationId, message)`.

### Changed

- **Settings → AI** is now exactly three controls (§8.1): the global AI enable switch, the reindex
  button (+ status panel), and Max parallel bundle AI calls (now always shown, no longer gated by a
  stats mode).
- Operator chat send no longer passes a stats mode or response locale — `SendToAiWithOperatorStats`
  is invoked with `(conversationId, message)` only (D10/D11). The per-message locale badge was dropped
  from the chat message header (the chat is locale-free, D10).

### Removed

- The `off` / `inline` / `live` stats-mode selector from Settings → AI (D11).
- The response-locale argument from the operator chat send path (D10).

---

## [1.0.5]

### Added

- **Admin profile** all-faces role grid: every platform face row with role select, even
  without prior `UserFaceRole` membership.
- PATCH upsert creates membership; per-row pending, optimistic query patch, face filter
  (>8 faces), face detail links, differentiated toasts.
- Vitest **SAP-U11…U14**; backend **SAP-B15…B20**.

### Changed

- `GET /api/admin/me/profile` returns all `Faces` with `hasMembership` and nullable
  `userRoleId` (left join).
- `mapAdminMeProfileDto` normalizes per-face nullable fields.

---

## [1.0.4]

### Changed

- Extract sibling-panel Props into colocated `types.ts` (profile detail editor,
  dashboard metric charts, album detail panels, admin profile faces table,
  AppBootstrapGate error UI).
- Extend monorepo verify script to scan component siblings and `types.ts` folders.

### Fixed

- README `**Version:**` prose synced with `VERSION` via monorepo badge script.

---

## [1.0.3]

### Added

- Colocated `types.ts` / `constants.ts` (and optional `enums.ts` / `schemas.ts`) across
  components, tables, dashboard widgets, pages, hooks, providers, and contexts — props and
  module-level literals no longer live inline in primary TSX entry files.
- Vitest colocation regression suite (`*.colocation.edge.test.ts`) with CI gate
  (`adminTypesColocationCiGate.ts`, monorepo `verify-admin-types-colocation-tests.mjs`).
- `src/components/README.md` documents split-file convention, audit/verify commands, and
  types-colocation prompt link.

### Changed

- `hooks/api/**` hooks re-foldered to `useXxxApi/useXxxApi.ts` + `types.ts` + `index.ts`
  where domain types were extracted; `QueryProvider` moved to folder layout.
- `ContentModerationPage` filter constants split from legacy `moderationFiltersTypes.ts`
  into `constants.ts` + `types.ts`; `profileDetailGridTypes.ts` renamed to `types.ts`.
- Context value types consolidated in `src/contexts/types.ts`.

---

## [1.0.2]

### Added

- Add README shield badges (version, CI, stack tech) via sync-readme-badges.py.

---

## [1.0.1]

### Changed

- Document project author (Ladislav Kostolny, 01laky@gmail.com) in README and standard manifests.

---

## [1.0.0]

### Added

- Push config panel for operator worker settings (FCM credentials, save, test).

### Fixed

- Infra smoke tests in jsdom; sidebar framer-motion variant types.

## [0.8.0]

### Added

- MailerConfigPanel; super-admin global search autocomplete; ASH1 security tests.
- de/fr/it languages; global preloader and brand font.

### Changed

- Phase A structural DRY pass.

## [0.7.0]

### Added

- Operator management consoles (albums, reels, blogs, stories, face profile, chat rooms).
- TanStack Query and Table rollout; infra smoke panel; AI worker host profile UI.
- Live stats settings; global AI master switch; super-admin capability gating.

## [0.6.0]

### Added

- Super-admin platform DMs; TanStack Table server pagination/sort/filter.
- Face detail entity tables with row-click navigation.

### Changed

- Removed registration invites UI.

## [0.5.0]

### Added

- Two-pane operator AI inbox with DB threads; operator user detail console.
- Locale-aware AI send and hub error i18n.

## [0.4.0]

### Added

- Operator stats dashboard; operator AI public stats panel; backend localization fetch.

## [0.3.0]

### Added

- Super-admin moderation queue with metrics, bulk actions, review console; ACL capabilities.

## [0.2.0]

### Added

- Dashboard stats, AI chat page, wall tickets moderation; admin face URL prefix.

## [0.1.0]

### Added

- Admin SPA foundation with OAuth2 and Docker dev scripts.

[Unreleased]: https://github.com/01laky/many_faces_admin/compare/v1.2.4...HEAD
[1.0.5]: https://github.com/01laky/many_faces_admin/compare/v1.0.4...v1.0.5
[1.0.4]: https://github.com/01laky/many_faces_admin/compare/v1.0.3...v1.0.4
[1.0.3]: https://github.com/01laky/many_faces_admin/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/01laky/many_faces_admin/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/01laky/many_faces_admin/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/01laky/many_faces_admin/compare/v0.8.0...v1.0.0
[0.8.0]: https://github.com/01laky/many_faces_admin/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/01laky/many_faces_admin/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/01laky/many_faces_admin/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/01laky/many_faces_admin/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/01laky/many_faces_admin/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/01laky/many_faces_admin/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/01laky/many_faces_admin/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/01laky/many_faces_admin/releases/tag/v0.1.0
[1.2.4]: https://github.com/01laky/many_faces_admin/compare/v1.2.3...v1.2.4
[1.2.3]: https://github.com/01laky/many_faces_admin/compare/v1.2.2...v1.2.3
[1.2.2]: https://github.com/01laky/many_faces_admin/compare/v1.2.1...v1.2.2
[1.2.1]: https://github.com/01laky/many_faces_admin/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/01laky/many_faces_admin/compare/v1.1.0...v1.2.0
