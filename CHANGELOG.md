# Changelog

All notable changes to **`many_faces_admin`** are documented here.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) — **version headings only, no dates**. SemVer: [`VERSION`](./VERSION).

### Release index

| Version       | Theme                                    |
| ------------- | ---------------------------------------- |
| [1.0.3](#103) | Types/constants colocation rollout       |
| [1.0.0](#100) | Push config panel                        |
| [0.8.0](#080) | Mail config, global search, ASH1, i18n   |
| [0.7.0](#070) | Operator consoles, TanStack, infra smoke |
| [0.6.0](#060) | Platform DMs, server-driven tables       |
| [0.5.0](#050) | Operator AI chat and user detail         |
| [0.4.0](#040) | Stats dashboard, registration invites    |
| [0.3.0](#030) | Moderation queue, ACL                    |
| [0.2.0](#020) | Dashboard, wall tickets, face routing    |
| [0.1.0](#010) | Admin SPA foundation                     |

## [Unreleased]

### Added

### Changed

### Fixed

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

### Added

- Add README shield badges (version, CI, stack tech) via sync-readme-badges.py.

### Changed

### Fixed

---

## [1.0.1]

### Changed

- Document project author (Ladislav Kostolny, 01laky@gmail.com) in README and standard manifests.

### Added

### Changed

- Document project author (Ladislav Kostolny, 01laky@gmail.com) in README and standard manifests.

### Fixed

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

[Unreleased]: https://github.com/01laky/many_faces_admin/compare/v1.0.3...HEAD
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
