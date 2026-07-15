## Why

Client review of the `repositories-universal` feature (SuperAdmin catalogs: doctors, specialties,
medical centers, insurers, pharmacies) surfaced eight usability and design issues that block
sign-off: no manual way to collapse the sidebar on desktop, an inconsistent loading state when
switching catalogs, oversized table rows, an unsafe one-click reactivate action, illegible status
badges, no photo/logo support for doctors and insurers, and too little seed data to see pagination
in action (which doesn't exist yet). This change addresses all eight in one sync so the feature can
be re-reviewed as a whole.

## What Changes

- Add a manual collapse/expand toggle button to the bottom of `Sidebar.tsx` for the desktop tier,
  wired to the existing (currently unused) `sidebarCollapsed` state in `ui.store.ts`. The tablet
  tier keeps its forced auto-collapse; the mobile tier keeps its overlay open/close behavior — only
  desktop gains manual control.
- Standardize table row height to 48px (`h-12` + `py-0` cells) across all five `*List.tsx`
  components. Skeleton loading rows already exist in all five lists; audit and align their heights
  to match.
- Require confirmation before reactivating a record, matching the existing deactivate flow: each
  `*List.tsx`/`*ListPage.tsx` pair gets a `reactivateTarget` state and a second `ConfirmModal`
  instance, instead of calling `reactivateX(id)` directly from the row action.
- Fix illegible status badges: `StatusBadge.tsx` currently pairs `--color-signature-mint` (bg) with
  `--color-signature-forest` (text) for the active state — both tokens resolve to near-identical
  lightness in both themes, making the text unreadable. Replace with an explicit, contrast-checked
  color pair for active/inactive in both light and dark mode.
- Add optional `avatarUrl` to `Doctor` (photo, circular, falls back to initials) and optional
  `logoUrl` to `Insurer` (logo, rounded-rect, falls back to initials), with a simulated local-file
  upload (`URL.createObjectURL`) in each entity's form modal and a matching column in each list.
- Add a client-side pagination hook (10 rows/page) applied to all five `*List.tsx`, and expand mock
  seed data (specialties, doctors, medical centers, insurers, pharmacies) so pagination is visible
  with realistic filtered/searched result sets.

## Capabilities

### New Capabilities

(none — this change modifies behavior of an existing capability rather than introducing a new one)

### Modified Capabilities

- `repositories-universal`: standardized row height, reactivate confirmation, legible status
  badges, optional avatar/logo fields for doctors and insurers, and client-side pagination across
  all five catalog list views.
- `layout-shell`: the existing "Persistencia del estado del sidebar" requirement already describes
  a user manually collapsing the sidebar and that state persisting, but no control ever set
  `sidebarCollapsed` — this change wires the missing toggle. The existing "Comportamiento responsive
  del Sidebar" requirement (desktop always expanded) is updated to allow a manually-collapsed
  desktop state.

## Impact

- **Modified code**: `src/components/layout/Sidebar.tsx`, `src/stores/ui.store.ts` (no shape
  change, now actually consumed), `src/hooks/useSidebar.ts` (desktop `collapsed` becomes
  `tier === 'tablet' || (tier === 'desktop' && sidebarCollapsed)`).
- **Modified code**: all five `src/features/repositories-universal/components/*/​*List.tsx` and
  their `*ListPage.tsx` (reactivate confirm, row height, pagination controls), the two form modals
  `DoctorFormModal.tsx` and `InsurerFormModal.tsx` (upload field), `src/components/shared/
  StatusBadge.tsx`.
- **New code**: `src/hooks/usePagination.ts`, `src/lib/utils.ts` gains `getInitials()`.
- **Data model**: `src/types/index.ts` — add `Doctor.avatarUrl: string | null` and
  `Insurer.logoUrl: string | null` (both optional, additive, non-breaking).
- **Seed data**: `src/mock/seed/doctors.ts`, `specialties.ts`, `medical-centers.ts`, `insurers.ts`,
  `pharmacies.ts` — expanded records via new `SEED_IDS` entries, mix of active/inactive.
- **Config**: `src/config/app.config.ts` — `mock.simulatedDelayMs` 300 → 400,
  `pagination.defaultPageSize` 20 → 10 (single source of truth for the new pagination hook).
- **i18n**: `src/i18n/locales/en.json` and `es.json` — new keys under `layout.*` (collapse/expand)
  and `repositories.*` (reactivate confirmation copy, avatar/logo field labels).
- **Depends on**: `mc-s05-feature-repositories-universal` (this change modifies its output; that
  change's proposal/specs are the baseline being revised here).
