# Many Faces AI (MFAI) - admin panel application

**Operator cockpit for Many Faces AI.** This React app is where **platform super-admins** manage faces, pages, users, moderation, operator AI chat, dashboard metrics, and settings that shape the user-facing portal.

**Sign-in:** **`SUPER_ADMIN` only** — global **`ADMIN`** must use **`many_faces_portal`**. Guide: [`docs/guides/admin-superadmin-only-access.md`](../docs/guides/admin-superadmin-only-access.md).

> **First visit?** This is the **control plane** — grid layouts edited here render on the portal; AI chat and infra settings configured here drive backend behaviour.

### Three pillars

| Pillar | Highlights |
| ------ | ----------- |
| **Security (ASH1)** | Super-admin gate: JWT role **and** `platform:super` capability (fail closed). HTTPS-only production API; SignalR JWT via `accessTokenFactory`; sanitized moderation previews. CI: `node ../scripts/verify-admin-security-tests.mjs`. Full guide: [`docs/SECURITY.md`](./docs/SECURITY.md). |
| **AI** | **Operator AI chat** (SignalR, threaded conversations); stats modes **off / inline / live** (platform KPIs attached to prompts); **live map-reduce** parallel cap + Redis TTL in Settings. Dashboard: [`../docs/guides/admin-dashboard-metrics.md`](../docs/guides/admin-dashboard-metrics.md). |
| **Configuration** | **Grid layout editor** (`gridSchema` → portal/mobile); **Settings → Infrastructure** — mail worker (SMTP/From in DB), push/search smoke, AI options; faces, pages, roles, route translations; global search autocomplete. Mail: [`../docs/guides/admin-mailer-configuration.md`](../docs/guides/admin-mailer-configuration.md). |

### Security at a glance

- Super-admin gate: JWT role **and** `platform:super` capability (fail closed).
- Tokens in `localStorage`; logout clears auth + domain React Query caches.
- API traffic namespaced under `/admin/api/...`; OAuth and i18n bundle paths exempt.
- HTTPS required for production API URL; mixed content blocked at startup.
- SignalR JWT via `accessTokenFactory`, not URL query strings.
- Moderation previews and grid schema fields sanitized client-side (defense in depth).
- CI gate: `node scripts/verify-admin-security-tests.mjs` — see [`docs/SECURITY.md`](./docs/SECURITY.md).

| Start here        | Link                                                                                                |
| ----------------- | --------------------------------------------------------------------------------------------------- |
| **Security**      | [`docs/SECURITY.md`](./docs/SECURITY.md) — sign-in, tokens, HTTPS, SignalR, production checklist   |
| Run in full stack | `../scripts/start-all-dev.sh` from `many_faces_main`                                                |
| Local app (LAN)   | `http://localhost:8090` / `https://localhost:8091` via admin proxy                                  |
| Local app (host)  | `https://localhost:8082` (`yarn dev` / Docker admin container) — see [`dev-https.md`](../docs/guides/dev-https.md) |
| Access policy     | [`docs/guides/admin-superadmin-only-access.md`](../docs/guides/admin-superadmin-only-access.md)     |
| Performance / Query | [`docs/performance-and-query-appendix.md`](./docs/performance-and-query-appendix.md)              |
| Design guide      | [`docs/guides/admin-ui-list-and-detail-pages.md`](../docs/guides/admin-ui-list-and-detail-pages.md) |
| AI dashboard/chat | [`docs/guides/admin-dashboard-metrics.md`](../docs/guides/admin-dashboard-metrics.md)               |

```mermaid
flowchart LR
    operator["Admin / Operator"] --> admin["many_faces_admin<br/>React + Vite"]
    admin --> api["many_faces_backend<br/>REST + SignalR"]
    admin --> settings["Settings<br/>AI mode · parallel · Redis TTL"]
    admin --> pages["Page/grid editor"]
    admin --> moderation["Moderation + user ops"]
    settings --> api
    pages --> api
    moderation --> api
    api --> pg["PostgreSQL"]
    api --> ai["many_faces_ai + Ollama"]
```

## Agent / AI layout guide

For **list tables** and **detail pages**, follow **[`docs/guides/admin-ui-list-and-detail-pages.md`](../docs/guides/admin-ui-list-and-detail-pages.md)** (Cursor: `.cursor/rules/admin-ui-list-detail-pages.mdc`, entry: [`AGENTS.md`](./AGENTS.md)).

## Overview

The MFAI admin panel is the operator-facing React application for configuring Many Faces AI. It manages the structural data that shapes the user-facing experience: users, faces, page types, pages, localized routes, role-aware access, and the grid layout schemas rendered by the frontend.

The admin application is built around the same **faces** concept as the user frontend. A face can represent a public community, private group, branded space, or specialized social environment. Admin users configure those spaces by creating faces, assigning pages, editing page metadata, managing localized route translations, and arranging reusable social modules inside responsive page grids.

The most important bridge between the admin panel and frontend is the page `gridSchema`. Admin users edit the schema through `GridLayoutEditor`, choose component types through `ComponentPickerModal`, drag/resize blocks with `react-grid-layout`, and save the result through the Pages API. The frontend later reads the same schema and renders matching `PageGridLayout` / `ComponentBlock` structures for end users.

Security and trust boundaries are part of the admin design. The app uses OAuth2/JWT authentication, protected admin routes, capability warmup through `/me/capabilities`, role/permission helpers, and guarded views/actions so operational features are exposed intentionally. Backend enforcement remains the source of truth, while the admin UI mirrors those rules to keep sensitive administration workflows understandable.

From an engineering perspective, this submodule demonstrates a modern React admin architecture: generated OpenAPI clients, TanStack Query hooks, localized admin routes, reusable Radix-based form/table components, protected layouts, page editors, grid schema editing, Docker-based local development, linting, type checks, unit tests, and integration with the root monorepo scripts.

## What This Admin Panel Shows

- Admin CRUD workflows for users, faces, pages, and page types.
- Face/page configuration that directly drives the user-facing frontend.
- Localized admin routes and page route translation management.
- Responsive grid schema editing with draggable/resizable blocks.
- Component picking for albums, ads, blogs, chat rooms, profiles, reels, stories, and their grid/carousel variants.
- Preservation of component metadata such as title, icon, and bound content ids while layouts are edited.
- Superadmin-only **content moderation** for user-created albums, blogs, and reels: extended **filters**, **metrics** with **alerts**, **bulk** approve/reject/remove/requeue, per-item audit, and detail drawer — see [`docs/guides/ai-assisted-content-approval.md`](../docs/guides/ai-assisted-content-approval.md).
- **Super-admin user chat** (`/user-chat`): two-pane real-time DMs with end users via `MessengerHub` + `SendPlatformDirectMessage`; entry from user detail **Open chat** — see [`docs/guides/admin-superadmin-user-chat.md`](../docs/guides/admin-superadmin-user-chat.md).
- **Album detail** (`/albums/{id}?faceId=`): operator management console (media grid, moderation, delete + platform DM) — [`docs/guides/admin-album-detail-moderation.md`](../docs/guides/admin-album-detail-moderation.md).
- **Reel detail** (`/reels/{id}?faceId=`): operator management console (inline video, AI card, moderation, hard-delete + platform DM) — [`docs/guides/admin-reel-detail-moderation.md`](../docs/guides/admin-reel-detail-moderation.md).
- **Face wall tickets** (`/faces/:faceId/wall-tickets`): per-face idea backlog for operators — list filters, create ticket, staff comments, approve/deny/delete; entry from face detail on public faces — see [`docs/guides/admin-face-wall-tickets.md`](../docs/guides/admin-face-wall-tickets.md).
- **Operator dashboard** with platform-wide **statistics**, **charts** (`GET /api/Stats`, `GET /api/Stats/timeseries`), a **full metrics table**, an **“AI & public aggregates”** strip (current **off / inline / live** mode + optional preview of **`GET /api/Stats/public`**), **Settings** (general, **infrastructure** — **mail worker config** (platform + SMTP/From) + smoke tests for mail/push/search, AI statistics), and **AI Chat** that calls **`SendToAiWithOperatorStats`** — see [`docs/guides/admin-dashboard-metrics.md`](../docs/guides/admin-dashboard-metrics.md), [`docs/guides/admin-mailer-configuration.md`](../docs/guides/admin-mailer-configuration.md), and [`docs/guides/admin-settings-infrastructure-smoke-tests.md`](../docs/guides/admin-settings-infrastructure-smoke-tests.md).
- **Header global search** — magnifying-glass combobox in `AdminLayout`; debounced `GET /admin/api/search/autocomplete` with scroll load-more; navigates via `adminSearchDetailPath` — [`docs/guides/admin-global-search-autocomplete.md`](../docs/guides/admin-global-search-autocomplete.md). Vitest: `GlobalSearchAutocomplete.edge.test.tsx`, `useAdminGlobalSearch.edge.test.ts`, `adminSearchDetailPath.edge.test.ts`. CI: `node scripts/verify-admin-global-search-tests.mjs`.
- **Admin profile (`/profile`)** — super-admin self-service identity, password, face roles, avatar, email confirm — [`docs/guides/admin-superadmin-profile.md`](../docs/guides/admin-superadmin-profile.md). Hooks: `useAdminMeProfileApi.ts`. CI: `node scripts/verify-admin-me-profile-tests.mjs`.
- **Mail worker config (Settings → Infrastructure)** — platform + SMTP/From in DB — [`docs/guides/admin-mailer-configuration.md`](../docs/guides/admin-mailer-configuration.md). CI: `node scripts/verify-admin-mail-settings-tests.mjs`.
- OAuth2/JWT-backed protected admin routes.
- Capability-aware admin state loaded through `/me/capabilities`.
- Generated OpenAPI API client with typed services and models.
- TanStack Query hooks for resource loading, mutation, cache invalidation, and UI refresh.
- Docker-first local development that works both standalone and through the root monorepo scripts.
- Validation through ESLint, TypeScript checks, Vitest tests, and component/API hook tests.

## Content Moderation

The **Moderation** area reviews FE user-created albums, blogs, and reels. The UI targets **`SUPER_ADMIN`** only; the API enforces the same for queue reads, metrics, single actions, bulk, and audit fetches.

Typed hooks (`useContentModerationApi`) call `GET /api/contentmoderation`, `GET /api/contentmoderation/metrics` (unwraps `{ metrics, alerts }` for cards and banners), bulk `POST /api/contentmoderation/bulk`, and per-item approve/reject/remove/requeue. **Filters** cover content type, human and AI approval states, face, author, risk, flags substring, confidence band, submitted window, last reviewer, queue age, and moderation version. **Bulk** selection applies a shared reason where the backend requires it and shows per-row success/failure. Helpers in `src/utils/contentModeration.ts` normalize labels and reasons for display; Vitest covers the helpers.

```mermaid
flowchart LR
  L[Queue list] --> F[Primary and secondary filters]
  L --> M[Metrics and alert banner]
  L --> B[Bulk bar]
  L --> D[Detail plus audit]
```

## Dashboard metrics (operator home)

The **Dashboard** page loads consolidated platform statistics from **`GET /api/Stats`** and optional histograms from **`GET /api/Stats/timeseries`**. This requires the admin app to call the API under the **configured admin face prefix** (see `VITE_DEFAULT_FACE_PREFIX` / `src/config/env.ts`) so the backend grants **`CanManageAllFaces`**.

The **AI & public aggregates** panel and **Settings → AI chat — public statistics** use a **separate** URL shape for the anonymous snapshot: **`absolutePublicFaceUrl('/api/Stats/public')`** → **`/public/api/Stats/public`** on the same API host, so the browser (and automated tests) do not accidentally request **`/admin/...`** without a JWT. Modes (**`off`**, **`inline`**, **`live`**) and the live parallel cap are server-backed through **`GET/PUT /admin/api/operator-ai/public-stats-settings`**. **`ChatPage`** invokes **`SendToAiWithOperatorStats`** with the current server settings.

See the monorepo guide [**`docs/guides/admin-dashboard-metrics.md`**](../docs/guides/admin-dashboard-metrics.md) for ACL rules, **`AiStats:PublicSnapshotAbsoluteUrl`** (**live** mode), SignalR + gRPC flow, performance notes, and **test file references**.

```mermaid
flowchart TD
    subgraph Dash["Dashboard"]
        kpi["KPI cards + charts<br/>GET /api/Stats* via admin prefix"]
        strip["AI & public aggregates<br/>fetch /public/api/Stats/public when mode ≠ off"]
    end

    subgraph Chat["AI Chat"]
        sr["SignalR SendToAiWithOperatorStats"]
    end

    kpi --> adminapi["/admin/api/Stats"]
    strip --> publicapi["/public/api/Stats/public"]
    sr --> hub["ChatHub → gRPC many_faces_ai"]
```

## Admin Configuration Flow

Admin users configure the data model that the backend stores and the frontend later renders:

```mermaid
flowchart LR
    operator["Admin / Operator"] --> admin["many_faces_admin<br/>React admin panel"]
    admin --> auth["ProtectedRoute<br/>OAuth2 / JWT"]
    auth --> caps["/me/capabilities<br/>role + permission state"]

    admin --> users["Users<br/>list + operator detail"]
    admin --> faces["Faces<br/>community spaces"]
    admin --> moderation["Moderation<br/>SUPER_ADMIN queue"]
    admin --> pageTypes["Page Types<br/>page classification"]
    admin --> pages["Pages<br/>metadata, paths, index"]

    pages --> translations["Route translations<br/>en / sk / cz"]
    pages --> grid["GridLayoutEditor<br/>responsive schema editing"]

    users --> api["Backend API"]
    faces --> api
    moderation --> api
    pageTypes --> api
    translations --> api
    grid --> api
    api --> db["PostgreSQL<br/>stored admin data"]
```

## Grid Schema Lifecycle

The admin panel creates and updates the `gridSchema` that the frontend consumes as a read-only layout:

```mermaid
flowchart TD
    editPage["EditPagePage"] --> load["Load page + route translations<br/>usePage / usePageRouteTranslations"]
    load --> parse["Parse page.gridSchema JSON"]
    parse --> editor["GridLayoutEditor"]

    editor --> picker["ComponentPickerModal<br/>choose component type"]
    picker --> item["Grid item<br/>componentType, title, icon, bound ids"]
    item --> layout["react-grid-layout<br/>drag, resize, order"]
    layout --> preserve["applyLayoutToSchema<br/>preserve metadata"]

    preserve --> serialize["JSON.stringify(gridSchema)"]
    serialize --> save["updatePage mutation"]
    save --> invalidate["Invalidate page / pages / face queries"]
    invalidate --> frontend["many_faces_portal reads schema<br/>PageGridLayout renders blocks"]
```

## Features

- **Resource Management**
  - User management (create, read, update, delete)
  - Face management (create, read, update, delete)
  - Page management (create, read, update, delete)
  - Page Type management (create, read, update, delete)

- **Modern React Stack**
  - React 18 with TypeScript
  - Vite for fast development and building
  - React Router for navigation
  - React Query for API data management

- **User Authentication**
  - OAuth2 login flow
  - Protected admin routes
  - JWT token management

- **UI Components**
  - Custom Radix-based components (Button, Input, FormField, Table)
  - Bootstrap styling
  - Toast notifications
  - Responsive design with sidebar navigation

- **Internationalization (i18n)**
  - **Static UI copy** — `GET /api/localization/admin` at startup (backend `.resx`)
  - **CMS page route translations** — Create/Edit Page form → `PageRouteTranslations` in DB (separate from static bundle)
  - Languages: `en`, `sk`, `cz`; localized admin routes via `routes.*`
  - **Full architecture (Mermaid):** [`docs/guides/static-localization-and-i18n.md`](../docs/guides/static-localization-and-i18n.md)

- **API Integration**
  - Auto-generated API client from Swagger/OpenAPI
  - Type-safe API calls
  - Error handling and retry logic

## Technologies

- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **React Query (TanStack Query)** - Server state management
- **Bootstrap** - CSS framework
- **Yarn** - Package manager (PnP mode)
- **Vitest** - Unit testing framework

## Project Structure

```
many_faces_admin/
├── src/
│   ├── api/                # Auto-generated API client
│   │   ├── services/       # API service classes
│   │   ├── models/         # TypeScript models
│   │   └── core/           # API core utilities
│   ├── components/         # React components (colocated folders — see src/components/README.md)
│   │   ├── radix/          # Button, Input, FormField, Table (+ radix/index.ts vendor barrel)
│   │   ├── dashboard/      # DashboardCharts, metrics, moderation widget
│   │   ├── page-editor/    # GridLayoutEditor, ComponentPickerModal, GradientPicker
│   │   ├── tables/         # UsersTable, FacesTable, PagesTable
│   │   └── ...
│   ├── pages/              # Page components (one folder per page)
│   │   ├── UsersPage/
│   │   ├── LoginPage/
│   │   └── ...
│   ├── styles/forms/       # Shared UserForm / FaceForm / PageForm SCSS
│   ├── contexts/           # React contexts (Auth, App)
│   ├── hooks/              # Custom React hooks
│   │   └── api/            # API hooks (useUsersApi, useFacesApi, usePagesApi)
│   ├── i18n/               # Internationalization
│   ├── styles/             # Global styles
│   ├── utils/              # Utility functions
│   └── main.tsx            # Application entry point
├── public/                 # Static assets
├── docker-compose.yml      # Docker Compose configuration
├── Dockerfile.dev          # Development Dockerfile
├── Dockerfile              # Production Dockerfile
├── scripts/                # Shell helpers (Docker dev: start/stop/clear/rebuild, lint, fix-editor)
└── README.md               # This file
```

## Running

### Running in Docker Container (Recommended)

The easiest way to run the admin panel in development:

```bash
./scripts/start-dev.sh
```

This script will:

1. Check and install dependencies if needed
2. Run code validation (TypeScript, ESLint)
3. Format code with Prettier
4. Run unit tests
5. Start the Vite dev server in Docker
6. Make the app available at `http://localhost:8082`

**Note**: The script runs tests before starting. If tests fail, the startup is stopped.

### Manual Docker Compose

```bash
docker-compose -f docker-compose.yml up --build
```

### Using Root Docker Compose

```bash
# From root directory
docker-compose -f docker-compose.dev.yml up -d admin-demo-dev
```

### Stopping Services

```bash
./scripts/stop-dev.sh
```

Or manually:

```bash
docker-compose -f docker-compose.yml down
```

### Clearing Everything

```bash
./scripts/clear-dev.sh
```

This removes containers, volumes, and images.

### Rebuilding Docker Images

To perform a clean rebuild of Docker images:

```bash
./scripts/rebuild-dev.sh
```

**Note**: This only builds images, it does NOT start containers. Use `./scripts/start-dev.sh` to start containers after rebuilding.

### Local Development (Without Docker)

1. **Install dependencies**:

   ```bash
   yarn install
   ```

2. **Start development server**:

   ```bash
   yarn dev
   ```

   The app will be available at `http://localhost:8082`

3. **Run tests**:

   ```bash
   yarn test
   ```

4. **Format code**:

   ```bash
   yarn format
   ```

5. **Build for production**:
   ```bash
   yarn build
   ```

## Configuration

### Environment Variables

The admin panel uses environment variables (configured in `docker-compose.yml` or `.env`):

- `VITE_API_URL` - Backend API URL (default: `http://localhost:8000`)
- `VITE_API_HTTPS_URL` - Backend API HTTPS URL (default: `https://localhost:8001`)
- `VITE_APP_NAME` - Application name (default: `Many Faces Admin`)
- `VITE_APP_VERSION` - Application version
- `VITE_PORT` - Dev server port (default: `8081`)
- `VITE_DEV_PORT` - Development port mapping (default: `8082`)

### API Configuration

The API client is auto-generated from the backend Swagger/OpenAPI specification. To regenerate:

```bash
yarn generate:api
```

This updates the API client in `src/api/` based on the backend API schema.

## Pages

- **Home** (`/`) - Dashboard/landing page
- **Login** (`/login`) - Admin login page (OAuth2)
- **Users** (`/users`) - User list and management
  - `Create User` - Create new user form
  - `Edit User` - Edit existing user form
  - `User Detail` — **SUPER_ADMIN** operator console (read-only identity, badges, per-face `userRoleId`, bans with required reason, platform messenger DM). `/users/:id/edit` redirects here. API client: `src/api/operatorUsersApiClient.ts` (paths under `/api/operator-users/...`).
- **Faces** (`/faces`) - Face list and management
  - Similar CRUD pages as Users
- **Pages** (`/pages`) - Page list and management
  - Similar CRUD pages as Users

All pages support internationalization with localized routes.

## Components

### Custom Components

- **Button** - Styled button component
- **Input** - Text input component
- **FormField** - Form field with label and validation
- **Table** - Data table component with sorting and pagination
- **UsersTable** - User-specific table with actions
- **FacesTable** - Face-specific table with actions
- **PagesTable** - Page-specific table with actions
- **Sidebar** - Navigation sidebar
- **Header** - Application header with navigation
- **LanguageSwitcher** - Language selection dropdown
- **ProtectedRoute** - Route guard for authenticated users
- **GuestRoute** - Route guard for unauthenticated users

### API Integration

API client is generated from Swagger and provides type-safe methods:

```typescript
import { UsersService, FacesService, PagesService } from '@/api';

// Get all users
const users = await UsersService.getUsers();

// Create user
const newUser = await UsersService.createUser({
	email: 'user@example.com',
	password: 'password123',
	firstName: 'John',
	lastName: 'Doe',
});

// Update user
await UsersService.updateUser(userId, {
	firstName: 'Jane',
});

// Delete user
await UsersService.deleteUser(userId);
```

### Custom Hooks

The admin panel provides custom hooks for API operations:

- `useUsersApi()` - User management hooks
- `useFacesApi()` - Face management hooks
- `usePagesApi()` - Page management hooks
- `useAuthApi()` - Authentication hooks

## Development Workflow

1. **Start backend**: Ensure backend API is running (via **many_faces_backend** / `many_faces_backend/` or monorepo `./scripts/start-all-dev.sh`)

2. **Start admin panel**: Run `./scripts/start-dev.sh` or use monorepo `./scripts/start-all-dev.sh` to start all services

3. **Make code changes**: Edit code in `src/`

4. **Test changes**:
   - Unit tests: `yarn test`
   - Component tests: `yarn test` (colocated under component folders, e.g. `UsersTable/UsersTable.test.tsx`, and `src/hooks/api/__tests__/`)
   - Manual testing: Open `http://localhost:8082`

5. **View logs**: Check Docker logs or browser console

6. **Stop services**: Run `./scripts/stop-dev.sh` or monorepo `./scripts/stop-all-dev.sh`

## Testing

### Run Tests

```bash
yarn test
yarn test:security   # ASH1 Vitest *.security.test.ts subset
```

From monorepo root:

```bash
node scripts/verify-admin-security-tests.mjs
```

### Run Tests in Watch Mode

```bash
yarn test:watch
```

### Run Tests with Coverage

```bash
yarn test:coverage
```

Tests are located in:

- `src/components/tables/UsersTable/UsersTable.test.tsx`, etc. - Colocated table tests
- `src/hooks/api/__tests__/` - API hook tests (useFacesApi, usePagesApi, useUsersApi)
- `src/utils/__tests__/` - Utility function tests

## Code Quality

### Linting

```bash
yarn lint
```

### Formatting

```bash
yarn format
```

### Type Checking

```bash
yarn type-check
```

### eslint-plugin-react-hooks (ESLint 10 peers)

Stable `eslint-plugin-react-hooks@latest` did not yet list ESLint **10** in `peerDependencies`, which caused Yarn **`YN0060`** / **`YN0086`** with ESLint 10 in this workspace. The project therefore pins an **exact** canary version whose peers include **`^10.0.0`** (see [facebook/react#35758](https://github.com/facebook/react/issues/35758)). **Removal trigger:** when `npm view eslint-plugin-react-hooks@latest peerDependencies` includes `^10.0.0` for `eslint`, switch `package.json` to that stable release and re-run `yarn install --immutable` plus `yarn validate` / `yarn test` / `yarn build`. **Automation:** bumps are **manual** here (no Dependabot ignore list ships in-repo).

## Build

### Development Build

```bash
yarn build
```

### Production Build

```bash
yarn build
```

Output will be in `dist/` directory, ready for deployment.

## Integration with Root Project

This admin panel is part of the **`many_faces_main`** monorepo (`many_faces_admin/` submodule on GitHub: `many_faces_admin`) and integrates with:

- **Backend API**: **many_faces_backend** (`many_faces_backend/`, ASP.NET Core)
- **Database**: **many_faces_database** (`many_faces_database/`, PostgreSQL) — via backend
- **Redis**: **many_faces_redis** (`many_faces_redis/`) — job queue via backend
- **Frontend**: **many_faces_portal** (`many_faces_portal/`, user-facing application)

From the **many_faces_main** repository root, use the orchestration scripts to manage all services:

- `./scripts/start-all-dev.sh` - Start all services with live status screen
- `./scripts/stop-all-dev.sh` - Stop all services
- `./scripts/clear-all-dev.sh` - Clear all containers and volumes
- `./scripts/status-all.sh` - Show status of all services
- `./scripts/rebuild-all-dev.sh` - Rebuild all Docker images

## Troubleshooting

### Dependencies Not Installing

If Yarn PnP (Plug'n'Play) is causing issues:

```bash
# Check Yarn version
yarn --version

# Clear cache
yarn cache clean

# Reinstall
rm -rf .yarn/cache
yarn install
```

See `YARN_PNP.md` for more information.

### Port Already Allocated

If port 8082 is already in use:

```bash
# Find process using port
lsof -ti:8082

# Kill process
lsof -ti:8082 | xargs kill -9

# Or use clear script
./scripts/clear-dev.sh
```

### API Connection Failed

- Ensure backend API is running: `docker ps | grep be-demo-dev`
- Check API URL in environment variables
- Verify CORS is enabled on backend
- Check browser console for errors

### TypeScript Errors

- Ensure all dependencies are installed: `yarn install`
- Check TypeScript version: `yarn tsc --version`
- Try regenerating types: `yarn generate:api`

## Additional Documentation

- **Docker**: See `DOCKER.md` for Docker-specific documentation
- **Editor Setup**: See `SETUP_EDITOR.md` for IDE configuration
- **Yarn PnP**: See `YARN_PNP.md` for Yarn Plug'n'Play information
- **API Client**: See `src/api/README.md` for API client documentation
- **i18n**: [`docs/guides/static-localization-and-i18n.md`](../docs/guides/static-localization-and-i18n.md) (canonical) · `src/i18n/README.md` (code entrypoints)

## Central documentation (`many_faces_main`)

Inside the monorepo checkout, relative links such as [`../docs/guides/ai-assisted-content-approval.md`](../docs/guides/ai-assisted-content-approval.md) resolve to the shared `docs/` tree.

When viewing **only** this repository on GitHub, use the canonical monorepo URLs:

- [Documentation hub](https://github.com/01laky/many_faces_main/blob/main/docs/README.md)
- [Static localization and i18n](https://github.com/01laky/many_faces_main/blob/main/docs/guides/static-localization-and-i18n.md)
- [AI-assisted content approval](https://github.com/01laky/many_faces_main/blob/main/docs/guides/ai-assisted-content-approval.md) (portal + mobile + backend + AI pipeline)
- [Git submodules workflow](https://github.com/01laky/many_faces_main/blob/main/docs/guides/git-submodules.md)
- [Development and CI](https://github.com/01laky/many_faces_main/blob/main/docs/guides/development.md)
- [Mobile Expo client](https://github.com/01laky/many_faces_main/blob/main/docs/guides/mobile-expo-development.md) · [`many_faces_mobile`](https://github.com/01laky/many_faces_mobile) (read-only My submissions on device)
