# many_faces_admin — performance & data layer appendix

Companion to [`docs/prompts/admin-performance-and-refactor-agent-prompt.md`](../../docs/prompts/admin-performance-and-refactor-agent-prompt.md). **`many_faces_portal` mirror:** [`many_faces_portal/docs/performance-and-query-appendix.md`](../../many_faces_portal/docs/performance-and-query-appendix.md). Copy sections into a PR as evidence or waivers.

## Node / toolchain

- **Vite 8:** Node **20.19+** or **22.12+** (see `package.json` `engines` and `many_faces_admin/.nvmrc`).
- Optional: `yarn check-node` before `yarn build` / `yarn validate`.

## TanStack Query — defaults vs hooks

| Layer                                                                 | `staleTime`                      | `gcTime` / notes                                       |
| --------------------------------------------------------------------- | -------------------------------- | ------------------------------------------------------ |
| **Global defaults** (`QueryProvider.tsx`)                             | `5 * 60 * 1000` (5 min)          | `10 * 60 * 1000` — inactive cache cleared after 10 min |
| **`useMeCapabilities`** (via `createMeCapabilitiesQueryOptions`)      | `60_000` (1 min)                 | inherits default `gcTime`                              |
| **`useAuthToken`** (`useAuthApi.ts`)                                  | `60_000`                         | session-scoped                                         |
| **`useUsersApi` / `useFacesApi` / `usePagesApi` / `usePageTypesApi`** | `5 * 60 * 1000` on list + detail | list uses `placeholderData: keepPreviousData` (v5)   |
| **`useWallTicketsAdminApi`**                                            | `45_000`                         | invalidates `['stats']` on ticket mutations            |
| **`useRegistrationInvitesAdminApi`**                                    | `60_000`                         | list defaults skip=0, take=50                          |
| **`useOperatorAiMessagesInfinite` / `useOperatorUserChatMessagesInfinite`** | `0`                          | `fetchNextPage` for older messages; hub patches first page |

**Query hook modules (2026-05):** `useWallTicketsAdminApi`, `useRegistrationInvitesAdminApi`; key factories `usersKeys`, `facesKeys`, `pagesKeys`, `wallTicketsKeys`, `registrationInvitesKeys`, exported `moderationKeys`.

**`enabled` audit:** list hooks require auth context token where applicable; detail hooks use `enabled: !!id` so no fetch without an entity id. Capabilities query uses `enabled: Boolean(token)`.

## ACL / `/me/capabilities`

| Consumer                                        | Role                                                                                                                    |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **`MeCapabilitiesWarmup`** in `AuthContext.tsx` | Single mount-time **`useMeCapabilities(token, Boolean(token))`** — primes React Query cache for the session.            |
| **`useAuthApi`**                                | **`clearAuthAndCapabilitiesQueries`** removes auth, capabilities, and domain query roots on logout / refresh failure. |

No other production components call **`useMeCapabilities`** directly; capability checks read from the warmed cache / ACL helpers as designed.

## Session expiry & logout (source of truth)

1. **`setupAxiosInterceptors`** (`interceptors.ts`): **401** → refresh queue → on failure **`forceLogout`**, redirect to login, **`setAuthToken(null)`**. No `window` `auth:unauthorized` event in many_faces_admin.
2. **`AuthContext`**: `localStorage` bootstrap, **`setInterval`** expiry check (paused while `document.visibilityState === 'hidden'`, re-check on `visibilitychange`).
3. **React Query**: **`useAuthToken`**; logout and session expiry call **`clearAuthAndCapabilitiesQueries`** (auth + capabilities + users/faces/pages/chat/moderation/wall tickets/invites, etc.).

## Phase D — explicit waivers (no code change until product asks)

| Topic                                         | Decision                                                                                                                              |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **i18n lazy-load**                            | Keep **static JSON** imports in `i18n/config.ts` for predictable admin bundle; lazy HTTP loading deferred (smaller admin locale set). |
| **Table virtualization**                      | List UIs are moderate size; **@tanstack/react-table** without windowing until row-count SLA is defined.                               |
| **`react-toastify` CSS**                      | Stays in `main.tsx` global entry; **`ToastContainer`** uses **`limit={5}`**. Splitting CSS to an auth-only chunk deferred.            |
| **Axios face-prefix interceptor**             | No measured hot-path cost; keep current **`applyFacePrefixToRequestUrl`** in the interceptor.                                         |
| **Lighthouse / Profiler / Performance trace** | Run locally on `yarn build && yarn preview` and attach tables to the PR when benchmarking (not a CI gate here).                       |
| **`modulePreload`**                           | Vite defaults retained.                                                                                                               |

## Dependencies

- **`react-grid-layout` + `react-resizable`:** required by **`GridLayoutEditor`** / **Edit page** flow (not unused).
- **`form-data`:** explicit dependency for OpenAPI-generated **`src/api/core/request.ts`** (depcheck “missing” fix).
- **Depcheck false positives:** tooling such as **Commitlint**, **Husky**, **lint-staged**, **Pnpify**, **@types/jsdom**, **@testing-library/user-event** are used from config / hooks / tests, not always from `src/` imports alone.

## Vite build

- **`manualChunks`** and **`css.preprocessorOptions.scss.silenceDeprecations`** live in **`vite.config.ts`** (vendor split + quieter Bootstrap Sass deprecations).
