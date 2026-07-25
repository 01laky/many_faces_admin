# Changelog

All notable changes to **`many_faces_admin`** are documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) — **version headings only, no dates**. SemVer: [`VERSION`](./VERSION).

### Release index

| Version       | Theme                                              |
| ------------- | -------------------------------------------------- |
| [1.5.2](#152) | Sync package.json version and enforce it |
| [1.5.1](#151) | Localized moderation queue column headers          |
| [1.5.0](#150) | Real `tsc --build` gate + 149 type-error cleanup   |
| [1.4.2](#142) | Detail-page Vitest gap fill (RDM/SDM/ADM/ADPM)     |
| [1.4.1](#141) | Security dep bumps: vite, axios, form-data         |
| [1.4.0](#140) | CSP + strict transport headers on nginx host       |
| [1.3.2](#132) | AI-chat: larger thinking dots, leaner waiting hint |
| [1.3.1](#131) | AI-chat "Thinking" dots + thread-title truncation  |
| [1.3.0](#130) | Operator-AI message request duration               |
| [1.2.4](#124) | Fix admin i18n load on direct Vite :8082           |
| [1.2.3](#123) | formatBytes edge tests (test-gap fill)             |
| [1.2.2](#122) | Refactor pass: dedup, dead code, stable keys       |
| [1.2.1](#121) | Bug-fix pass: chat header, cache wipe, JWT         |
| [1.2.0](#120) | Operator AI live token streaming in chat           |
| [1.1.0](#110) | Operator AI RAG retrieval: 3-control AI page       |
| [1.0.5](#105) | Admin profile all-faces role grid                  |
| [1.0.4](#104) | Colocation verify hardening + sibling Props        |
| [1.0.3](#103) | Types/constants colocation rollout                 |
| [1.0.0](#100) | Push config panel                                  |
| [0.8.0](#080) | Mail config, global search, ASH1, i18n             |
| [0.7.0](#070) | Operator consoles, TanStack, infra smoke           |
| [0.6.0](#060) | Platform DMs, server-driven tables                 |
| [0.5.0](#050) | Operator AI chat and user detail                   |
| [0.4.0](#040) | Stats dashboard, registration invites              |
| [0.3.0](#030) | Moderation queue, ACL                              |
| [0.2.0](#020) | Dashboard, wall tickets, face routing              |
| [0.1.0](#010) | Admin SPA foundation                               |

## [Unreleased]

### Added

### Changed

### Fixed

---

## [1.5.2]

### Fixed

- **`package.json` `version` had drifted from `VERSION`, and nothing checked it.** CLAUDE.md requires the frontends to keep the two in sync; portal and admin had never been synced (`0.0.0` against a `VERSION` well past 1.x) and mobile sat one patch behind, because `scripts/bump-version.sh` does not touch `package.json`. `scripts/verify-version-files.sh` only compared `VERSION` against the newest CHANGELOG heading, so the rule lived as prose and prose does not fail a build. The script now also asserts `package.json` version equals `VERSION`, with an error naming the likely cause. Verified both ways: setting `package.json` to `9.9.9` fails the gate, restoring it passes. `yarn install --immutable` stays clean, so the version change does not dirty the lockfile.

---

## [1.5.1]

### Changed

- **Moderation queue table headers are now localized.** `ModerationQueueTable` rendered all nine
  column headers as hardcoded English literals. They now resolve through `useTranslation('common')`
  against the backend `resx` bundle: `pages.moderation.colSelect`, `colType`, `colTitle`, `colFace`,
  `colAuthor`, `colStatus`, `colAi`, `colReason`, plus `common.actions` for the actions column
  (reusing the shared key instead of adding a duplicate, matching `FacesTable`). All eight
  `pages.moderation.col*` keys ship in the backend for every supported locale (en/sk/cs/de/fr/it).
  `t` was added to the `columns` `useMemo` dependency array so headers re-render on language change.

---

## [1.5.0]

### Added

- **`src/pages/StoryDetailPage/__tests__/StoryDetailPage.test.tsx`: a regression case for the image preview.** Clicking a grid tile must mount the preview viewer on the clicked image and the next/prev controls must page it. The case fails against the old prop names, so it pins the fix below.
- **`formatChartTooltipValue` + `ChartTooltipValue` in `src/components/dashboard/DashboardMetricsTable/constants.ts`.** A shared recharts tooltip formatter that narrows the real `ValueType | undefined` union (number, string, `ReadonlyArray`, undefined) instead of the four call sites each claiming `(v: number)`.

### Changed

- **`yarn type-check` now runs `tsc --build --noEmit` and actually type-checks this SPA.** The root `tsconfig.json` is `"files": []` with project references, so plain `tsc` (no `--build`) checked the _root_ project — zero files — exited 0, and never visited `tsconfig.app.json` or `tsconfig.node.json`. `vite build` does not type-check either, so nothing in `yarn validate` or in CI had ever checked types here and every type error merged silently. Proven both directions: with `const __probe: number = 'nope'` injected into `src/main.tsx`, `yarn type-check` exits 0 before the change and 2 after; the clean tree exits 0. Same fix and reasoning as `many_faces_portal` 1.1.5 (commit `5102fab`).
- **Closed the 149 type errors that the no-op gate had been hiding, across 77 files.** No `any`, no `as unknown as`, no `@ts-ignore`/`@ts-expect-error` anywhere in the fix; runtime behaviour is unchanged except for the three genuine bugs listed under Fixed. The bulk resolved at their source rather than per call site:
  - **Barrel files never re-exported their colocated types** (~47 errors). `ConfirmModal`, `GlobalAppPreloader`, `ModerationStatusChips`, `AdminTablePagination` and `WallTicketsTable` re-exported their `*Props` from the component module instead of `./types`; twelve `src/hooks/api/*` barrels exported only values. A failed type re-export degrades to `any`, which is why one broken line in `ConfirmModal/index.ts` made `ConfirmModalOptions = Pick<ConfirmModalProps, …>` resolve to all-required and broke fourteen unrelated `confirm({…})` call sites.
  - **`ModerationFilterSetters` collided with `ModerationFilterState`** (18 errors). The mapped type reused the _state_ key names, so `ModerationFiltersProps` extended two types that disagreed on every key. Now key-remapped to `set${Capitalize<K>}`, matching what `ModerationFilters` destructures.
  - **react-hook-form input vs. output shapes** (15 errors across five forms). `yupResolver` is typed `Resolver<Input, Context, InferType<schema>>`: the input keeps every key present and widens `.optional()` fields to `T | undefined`, while the output turns them into optional keys — two shapes that cannot be collapsed into one interface. Each form now declares a `…FormValues` input type beside its `…FormData` output type and calls `useForm<…FormValues, unknown, …FormData>`.
  - **Radix `TableCellProps`/`TableHeaderCellProps` extended `HTMLAttributes`**, which has no `colSpan` (4 errors). They render `<td>`/`<th>` and spread `...props`, so the attribute already worked — the base type was simply wrong. Now `TdHTMLAttributes`/`ThHTMLAttributes`.
  - **Generated-client optionality handled honestly** (~12 errors in `ChatPage`, `operatorAiChatUtils`, `useAlbumsApi`). `openapi-typescript-codegen` marks server-guaranteed fields optional; these now default or guard at the DTO→UI seam (`items ?? []`, `content ?? ''`, `id ?? null` for a selector that takes `number | null`) instead of asserting.
  - **Interfaces have no implicit index signature** (4 errors). `UseFacesParams`, `UsePagesParams`, `UseUsersParams` (passed to `logger.info`'s `Record<string, unknown>`) and `GridSchema`/`GridItem` (passed to `sanitizeGridSchemaForSave`'s `GridSchemaLike`) are now type aliases, which do.
  - **Dead bindings removed** (5 errors): a private duplicate of `isAdminScopedApiRequest` in `src/api/interceptors.ts` shadowing the real exported-and-tested one in `src/api/interceptorPolicy.ts`, plus unused parameters on `shouldSyncUserMessageFromReason`, `storyImagesToMediaItems`, `getTranslatedRoute` and `getEnglishRoute` (call sites and tests updated; `getAllRouteTranslations` in the same file already took no language argument).
  - Remaining singles: recharts label/tooltip prop types, the `ModerationPlainTextPreview` and `Button` variant contracts, `useAdminListSortValidationFeedback`'s setter type (it only ever calls `setSorting([])`), `testFcm.mutateAsync(undefined)`, and the `en.common.pages` bundle node in `fetchLocalizationBundle`.
- **`tsconfig.app.json` excludes test files**, mirroring `many_faces_portal`: `src/**/__tests__/**`, `src/**/*.test.ts`, `src/**/*.test.tsx`. Without it the vitest globals (`describe`/`it`/`expect`) error under the newly-real gate. Keeping tests inside the gate would be better in principle; matching the sibling SPA is the deliberate choice here rather than silently diverging, and it is the one piece of this change that is a convention decision rather than a fix.
- **`tsconfig.app.json` drops `"baseUrl": "."`** — deprecated in TS 6 (TS5101) and unnecessary, since `paths` entries resolve relative to the config file. Matches `many_faces_portal/tsconfig.app.json`.
- **Dead `size="sm"` props removed from seven Radix `Button` call sites.** The Radix `Button` has no `size` prop and no `.radix-button-sm` style, so the attribute only leaked to the DOM with no visual effect. Removing it changes nothing on screen; adding real size styling would have been a visual change beyond this fix.

### Fixed

- **The story image preview modal was dead code.** `StoryDetailPage` passed `open`/`initialIndex` to `ContentMediaPreviewModal`, whose contract is `show`/`index`/`onIndexChange`. `index` arrived `undefined`, so `items[index]` was `undefined` and the component hit its `if (!item) return null` guard on every render — clicking a story image never opened anything. Now matches the working `AlbumDetailPage`/`BlogDetailPage` call sites, with `onIndexChange` wired so next/prev work.
- **The video-lounge description never rendered.** `FaceVideoLoungeDetailPage` passed `text={data.description}` to `ModerationPlainTextPreview`, whose props are `label`/`value`; `value` was `undefined`, so the `<pre>` rendered empty. Now `label="" value={data.description}`, matching `FaceChatRoomDetailPage`.
- **Story detail deep links from the user-detail table used the wrong face.** `resolveStoryDetailFaceId` reads `row.faces`, but `StoryListItem` never declared it (its `AlbumListItem` and `ReelListItem` siblings do), so the lookup always fell through to the user's first face. `faces?: StoryFaceRef[]` moved onto `StoryListItem`, inherited by `StoryDetail`.
- **The selected section chip in `ProfileDetailSectionPickerModal` rendered unstyled.** It asked for `variant="default"`, which is not one of the Radix `Button` variants, so no `radix-button-*` class was applied at all. Now `primary`, the selected-toggle variant already used by `FaceWallTicketsPage`.

---

## [1.4.2]

### Added

- **Closed the admin-side Vitest gaps in four detail-page test matrices.** An audit found the `U`/page-level rows of `admin-reel-detail-moderation`, `admin-story-detail-management`, `admin-album-detail-photos-delete-notify` and `admin-face-profile-detail-management` only partly implemented — the reel, story and face-profile detail pages had no page-level test at all, and the album matrix was missing the grid/modal/dialog component tests. Ten new test files, 66 new cases, no production code touched:
  - `src/pages/ReelDetailPage/__tests__/ReelDetailPage.test.tsx` — RDM-U3 (moderation card hidden for a non–super-admin token), RDM-U4 (open-chat deep link), RDM-U6 (Open in queue carries `contentId`), RDM-U7 (Approve opens the override dialog instead of mutating when AI recommended reject), RDM-U8 (Template B card order + testids), RDM-U9 (preview modal mounted with `showDelete={false}`), plus loading/error/empty-video states.
  - `src/pages/ContentModerationPage/__tests__/ContentModerationPage.urlInit.test.tsx` — RDM-U6: the queue initialises `contentId`/`contentType` from the URL and drops the default `PendingApproval` filter on a `contentId` deep link.
  - `src/pages/ContentModerationPage/__tests__/ModerationItemDrawer.test.tsx` — RDM-U11: the drawer's "Open reel detail" targets `/reels/{id}?faceId=…` (and the album/blog equivalents).
  - `src/pages/StoryDetailPage/__tests__/StoryDetailPage.test.tsx` — SDM-U3, U4, U5, U6, U8, U9, U10, U11: Template B testids, live/expired badges, conditional viewers card, per-image delete through the reason dialog, post-delete navigation to the face path, the `image_delete_blocked_live` toast mapping and super-admin gating of the tile delete controls.
  - `src/pages/FaceProfileDetailPage/__tests__/FaceProfileDetailPage.test.tsx` — ADPM-U1, U2, U3, U4, U5, U8: Template B cards, absence of any moderation-queue control, management gating, open-chat deep link, conditional reviews card and the face-ban/unban control swap.
  - `src/pages/FaceProfileDetailPage/__tests__/FaceProfileDetailCommentsTable.test.tsx` — ADPM-U12: the per-row delete reports only its own comment id and no row carries a navigate handler.
  - `src/hooks/api/__tests__/useFaceProfilesApi.test.tsx` — ADPM-U6: comment/review deletes invalidate `faceProfilesKeys.all` and the profile detail key, and a failed delete invalidates nothing. First consumer of the previously unused `testUtils.createTestQueryClient` helper.
  - `src/components/AlbumDeleteReasonDialog/__tests__/AlbumDeleteReasonDialog.test.tsx` — ADM-U5 / RDM-U10 / ADPM-U10: Confirm stays disabled until reason and creator message are both valid, the 2001-character ceiling re-locks it, and the `requireUserMessage={false}` approve-override variant unlocks on a reason alone.
  - `src/components/ContentMediaGrid/__tests__/ContentMediaGrid.test.tsx` — ADM-U3 at the rendered-DOM level (the existing test covered only the pure `handleGridDeleteClick` helper).
  - `src/components/ContentMediaPreviewModal/__tests__/ContentMediaPreviewModal.test.tsx` — ADM-U4 at the rendered-DOM level, plus the `showDelete` gate that backs RDM-U9.

### Changed

- **Existing helper tests now carry their prompt case IDs in the test name** (`reelDetailMedia`, `reelDetailPaths`, `storyDetailMedia`, `storyDetailUi`, `StoryDetailPage.paths`, `albumDetailValidation`), so every `RDM-U*`, `SDM-U*`, `ADM-U*` and `ADPM-U*` row in the four matrices is greppable from the test tree. Assertions are unchanged.

---

## [1.4.1]

### Fixed

- **Security: cleared all high-severity `yarn npm audit` advisories.** Three direct dependencies were bumped to the first release that carries the fix, each staying inside its current major:
  - `vite` `^8.0.13` → `^8.0.16` (resolves 8.1.5) — [GHSA-fx2h-pf6j-xcff](https://github.com/advisories/GHSA-fx2h-pf6j-xcff), `server.fs.deny` bypass via Windows alternate path forms (vulnerable `>=8.0.0 <=8.0.15`). Dev-server-only exposure, but the floor is raised in `package.json` so the vulnerable range can never be re-resolved.
  - `axios` `^1.16.1` → `^1.18.0` (resolves 1.18.1) — [GHSA-gcfj-64vw-6mp9](https://github.com/advisories/GHSA-gcfj-64vw-6mp9), the Node HTTP adapter could reuse an inherited proxy after interceptor config cloning (vulnerable `>=1.15.2 <1.18.0`).
  - `form-data` `^4.0.5` → `^4.0.6` — [GHSA-hmw2-7cc7-3qxx](https://github.com/advisories/GHSA-hmw2-7cc7-3qxx), CRLF injection through unescaped multipart field names and filenames (vulnerable `>=4.0.0 <4.0.6`).

  All three are direct dependencies with a single dependent (`yarn why` confirmed), so no `resolutions` entry was needed. `yarn npm audit --severity high` now reports "No audit suggestions"; `yarn validate`, `yarn test` (595 passed / 8 skipped) and `yarn build` are green on the new versions with no source changes required.

---

## [1.4.0]

### Added

- **Content-Security-Policy baseline on the static host (ASH1-E1/E2/E3, FE-A1).** `nginx.conf` now sends a strict `Content-Security-Policy` (`script-src 'self'`, `style-src 'self' 'unsafe-inline'` for the inline preloader, `connect-src 'self' https: wss:`, `frame-ancestors 'none'`, `object-src 'none'`), tightens `X-Frame-Options` to `DENY`, and adds `Referrer-Policy: no-referrer`. Documented in [`docs/SECURITY.md`](./docs/SECURITY.md) §6 as a compensating control for `localStorage` token storage (DOC-4); the production checklist item is now ticked.

---

## [1.3.2]

### Changed

- Enlarged the AI-chat "Thinking" animated dots to ~2× (4→8px, with proportional gap/offset) for better visibility. Paired with the backend resx trim (1.6.3) the waiting state now reads as "Thinking" + dots over a plain "{{seconds}} s elapsed" line, without the CPU/RAM explanatory sentence.

---

## [1.3.1]

### Added

- **AI-chat "Thinking" indicator with animated dots.** While the operator-AI reply is being computed (no token streaming yet), the waiting bubble now shows the localized "Thinking" label followed by an animated three-dots indicator (CSS-only, staggered, `prefers-reduced-motion` aware → dots shown static). The label is announced once to screen readers via `role="status"`; the dots are decorative (`aria-hidden`). The elapsed-seconds hint line is unchanged and intentionally kept out of the live region so it is not re-announced every second.
- **Sidebar thread-title truncation.** A conversation's first message becomes its title; long ones previously stretched the chats sidebar. The displayed title is now truncated to the first 24 characters + an ellipsis (`truncateThreadTitle`, code-point safe), with the full title preserved on the row's `title` tooltip and `min-width:0` added so the CSS ellipsis also holds.

---

## [1.3.0]

### Added

- **AI message request duration in the chat header.** Each assistant message now shows how long the request took next to its timestamp (e.g. `AI · Jun 15, 2026, 9:29 AM · 3s`). New `formatMessageDuration(ms)` helper: `<1s` for sub-second responses, whole seconds under a minute (`3s`, `45s`), and `m:ss` from one minute up (`1:23`, `10:05`). `formatMessageHeader` appends it for assistant rows only; user and legacy (null-duration) rows are unchanged. The value comes from the new `OperatorAiMessageDto.durationMs` (carried through `mapOperatorMessageToUi` for both loaded history and live `OperatorAiMessageAppended` events). Unit tests cover every formatter branch + the header behaviour.

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

[Unreleased]: https://github.com/01laky/many_faces_admin/compare/v1.5.2...HEAD
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
[1.5.2]: https://github.com/01laky/many_faces_admin/compare/v1.5.1...v1.5.2
[1.5.1]: https://github.com/01laky/many_faces_admin/compare/v1.5.0...v1.5.1
[1.5.0]: https://github.com/01laky/many_faces_admin/compare/v1.4.2...v1.5.0
[1.4.2]: https://github.com/01laky/many_faces_admin/compare/v1.4.1...v1.4.2
[1.4.1]: https://github.com/01laky/many_faces_admin/compare/v1.4.0...v1.4.1
[1.4.0]: https://github.com/01laky/many_faces_admin/compare/v1.3.2...v1.4.0
[1.3.2]: https://github.com/01laky/many_faces_admin/compare/v1.3.1...v1.3.2
[1.3.1]: https://github.com/01laky/many_faces_admin/compare/v1.3.0...v1.3.1
[1.3.0]: https://github.com/01laky/many_faces_admin/compare/v1.2.4...v1.3.0
[1.2.4]: https://github.com/01laky/many_faces_admin/compare/v1.2.3...v1.2.4
[1.2.3]: https://github.com/01laky/many_faces_admin/compare/v1.2.2...v1.2.3
[1.2.2]: https://github.com/01laky/many_faces_admin/compare/v1.2.1...v1.2.2
[1.2.1]: https://github.com/01laky/many_faces_admin/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/01laky/many_faces_admin/compare/v1.1.0...v1.2.0
