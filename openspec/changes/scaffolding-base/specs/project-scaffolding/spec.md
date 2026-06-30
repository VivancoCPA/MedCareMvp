## ADDED Requirements

### Requirement: All production and development dependencies are installed
The project SHALL have all stack dependencies installed and resolvable before any feature work begins. Dependencies MUST match the exact major versions: react-router-dom@6, @tanstack/react-query@5, axios@1, zustand@4, react-hook-form@7, zod@3, i18next, react-i18next, lucide-react, clsx, tailwind-merge. Dev dependencies: tailwindcss@3, postcss, autoprefixer, @types/node.

#### Scenario: Developer installs dependencies
- **WHEN** a developer runs `npm install` in the project root
- **THEN** all dependencies resolve without errors and `node_modules` contains all required packages at the specified major versions

### Requirement: Source folder structure matches the feature-first architecture
The `src/` directory SHALL contain the complete folder structure defined for the project before any feature is built. Required top-level folders: `assets/`, `components/layout/`, `components/shared/`, `components/ui/`, `config/`, `features/`, `hooks/`, `i18n/`, `lib/`, `mock/`, `router/`, `stores/`, `styles/`, `types/`.

#### Scenario: Required feature folders exist
- **WHEN** the scaffolding is complete
- **THEN** `src/features/` contains subfolders for: `auth`, `users`, `groups`, `health-profile`, `appointments`, `consultation-results`, `auxiliary-exams`, `free-notes`, `dashboard`, `repositories-universal`, `repositories-group`

#### Scenario: Shared component placeholder files exist
- **WHEN** the scaffolding is complete
- **THEN** `src/components/layout/` contains placeholder files for `Shell`, `Sidebar`, `TopBar`, `PageWrapper` and `src/components/shared/` contains placeholder files for `MemberAvatar`, `AlertBadge`, `StatusBadge`, `EmptyState`, `ConfirmModal`, `FileUploader`

### Requirement: Application config is centralized in app.config.ts
The system SHALL expose a single `APP_CONFIG` constant from `src/config/app.config.ts` that centralizes all environment-dependent and tuneable values. It MUST be typed `as const` and cover: API base URL (from `VITE_API_BASE_URL` env var with fallback), upload limits (maxPdfSizeBytes, maxImageSizeBytes, allowedMimeTypes), session storage keys, mock mode toggle with simulated delay, pagination defaults, and dashboard config.

#### Scenario: API base URL reads from environment variable
- **WHEN** `VITE_API_BASE_URL` is set in the environment
- **THEN** `APP_CONFIG.api.baseUrl` equals that value

#### Scenario: API base URL falls back to localhost
- **WHEN** `VITE_API_BASE_URL` is not set
- **THEN** `APP_CONFIG.api.baseUrl` equals `'http://localhost:5043/api/'`

### Requirement: Shadcn/ui base components are installed
The project SHALL have the following Shadcn/ui components installed and available in `src/components/ui/`: button, input, label, select, dialog, toast, table, tabs, badge, avatar, card, separator, dropdown-menu, popover, command, form.

#### Scenario: Shadcn components are importable
- **WHEN** a developer imports `Button` from `@/components/ui/button`
- **THEN** the import resolves without TypeScript errors and the component renders correctly

### Requirement: dev server starts without errors
Running `npm run dev` SHALL start the Vite dev server and the app SHALL be accessible without compilation errors. The `/login` route MUST render without throwing a runtime error.

#### Scenario: dev server starts
- **WHEN** `npm run dev` is executed in the project root
- **THEN** the Vite server starts and reports no compilation errors in the terminal

#### Scenario: login route renders
- **WHEN** the browser navigates to `/login`
- **THEN** the page renders without a React error boundary being triggered
