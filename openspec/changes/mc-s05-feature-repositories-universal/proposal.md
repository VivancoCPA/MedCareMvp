## Why

SuperAdmin currently has no way to manage the five universal catalogs (doctors, specialties,
medical centers, insurers, pharmacies) that every group's repository and appointment flow
depends on. The sidebar routes exist (`/superadmin/doctors`, `/superadmin/specialties`, etc.)
but render placeholders. Without these CRUD screens, the seed data can never be extended or
corrected, and the upcoming group-repository import feature (mc-s08) has nothing real to import
from.

## What Changes

- Add full CRUD (create, edit, deactivate, reactivate) for Doctors, Specialties, Medical
  Centers, Insurers, and Pharmacies, restricted to the `superadmin` role.
- Each catalog gets a list page with real-time name search, status filter (Todos/Activo/
  Inactivo), and a modal form for create/edit — all five follow one identical list+modal
  pattern.
- Soft-delete only: deactivating a record sets `isActive = false` and never touches
  `deletedAt` (physical deletion is out of scope for this MVP).
- Doctors display their propagation origin (`originGroupId`): records created by a group
  Admin show a "Propagado" badge; SuperAdmin-created records show "SuperAdmin".
- Implement the two shared components this feature needs that currently exist only as
  stubs: `ConfirmModal` (generic confirm/cancel dialog) and `StatusBadge` (Activo/Inactivo
  badge), plus a real `useToast` hook (currently a no-op stub) so mutations can surface
  success/error feedback.
- **Data model adjustment**: add an optional `description` field to `Specialty` (requested
  by this feature, not currently in the type) and rename `Insurer.phone` to
  `Insurer.emergencyPhone` for clarity. Both fields are unused elsewhere in the codebase, so
  this is not a breaking change to any other feature.
- Connect the five existing placeholder routes under `/superadmin` in `src/router/index.tsx`
  to the new pages.

### Descoped from the original request

- The **médico ↔ centros médicos** relationship (multi-select "Centros" column/field on the
  Doctor form) is dropped. Nothing in the current data model (`Doctor`, `MedicalCenter`,
  or the `Group*` junction tables) models a doctor-to-center association — only
  group-to-entity junctions (`GroupDoctor`, `GroupMedicalCenter`, ...) exist, and those serve
  group repository propagation, not doctor practice locations. Introducing a new many-to-many
  relation is a data-model decision beyond this change's scope; the Doctor form covers name,
  specialty, phone, and email only.
- The Doctor form uses the existing `firstName`/`lastName` fields (not a single `fullName`
  field, which doesn't exist on the `Doctor` type).
- Per-page routes for creating/editing (e.g. `/superadmin/doctors/new`) are not implemented —
  the form lives as a modal inside each list page, consistent across all five catalogs.

## Capabilities

### New Capabilities

- `repositories-universal`: SuperAdmin-only CRUD catalogs for doctors, specialties, medical
  centers, insurers, and pharmacies — search, status filtering, soft-delete
  (deactivate/reactivate), and propagation-origin display for doctors.

### Modified Capabilities

- `shared-page-components`: adds real implementations (currently no-op stubs) for
  `ConfirmModal` (confirm/cancel dialog with configurable message) and `StatusBadge`
  (Activo/Inactivo badge driven by `isActive`), both consumed by the new catalog pages.

## Impact

- **New code**: `src/features/repositories-universal/**` (services, hooks, schemas,
  components, pages) for all five entities.
- **Modified code**: `src/router/index.tsx` (wire 5 routes), `src/i18n/locales/es.json` +
  `en.json` (new `repositories.*` keys, extend existing `validation.*`),
  `src/components/shared/ConfirmModal.tsx`, `src/components/shared/StatusBadge.tsx`,
  `src/hooks/useToast.ts` (stub → real implementation).
- **Data model**: `src/types/index.ts` and `openspec/specs/data-model.md` — add
  `Specialty.description: string | null`; rename `Insurer.phone` → `Insurer.emergencyPhone`.
  `src/mock/seed/specialties.ts` and `src/mock/seed/insurers.ts` updated to match.
- **New UI primitives**: `src/components/ui/textarea.tsx` and `src/components/ui/skeleton.tsx`
  (shadcn additions — no existing `ui/*` files are modified, per ADR-001).
- **Blocks**: `mc-s08-feature-group-repositories`, which imports from these catalogs.
- **Depends on**: `mc-s04-feature-layout-shell` (Shell, PageWrapper, Sidebar routes already
  in place).
