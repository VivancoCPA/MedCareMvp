## Why

`05-feature-repositories-universal` built the SuperAdmin-only universal catalogs (doctors,
medical centers, pharmacies, insurers, specialties). `07-feature-family-groups` introduced
family groups but left the onboarding steps for doctors and centers/pharmacies as
layout-only placeholders ("Omitir por ahora"), since populating a group's own repository was
explicitly deferred to a later change (MÓD-11 of the PRD). This change builds that deferred
functionality so each Admin can populate their own group's medical network.

## What Changes

- Add a `repositories-group` service (`group-repositories.service.ts`) exposing read,
  import-from-universal-catalog, create-own-entry-with-propagation, and
  deactivate-in-group-only operations for the four group repository entities
  (`GroupDoctor`, `GroupMedicalCenter`, `GroupPharmacy`, `GroupInsurer`) — these entities
  already exist in the data model (`data-model.md` § Group Repository Tables) and are not
  modified.
- Add hooks with query invalidation wiring for group repository reads, import candidates,
  import, create-own-entry, and deactivate mutations.
- Add `GroupRepositoriesPage` at `/admin/repositories` with one tab per entity type
  (doctors, medical centers, pharmacies, insurers), each backed by a shared
  `GroupRepositoryTab` component.
- Add `ImportEntityModal` (multi-select Command+Popover) to import existing universal-catalog
  records into a group's repository.
- Add `CreateOwnEntryModal` reusing the existing universal-catalog forms
  (`DoctorForm`/`MedicalCenterForm`/`PharmacyForm`/`InsurerForm`), which creates a new
  universal record with `originGroupId` set (bidirectional propagation) plus the
  corresponding group repository row.
- Add `DuplicateFoundDialog`, triggered by a case-insensitive name check against the full
  universal catalog before creating a new own entry, letting the Admin choose to import the
  existing record instead of creating a duplicate.
- Add a group-scoped deactivate action that flips `isActive` on the group repository row
  only, never on the universal record.
- Connect the doctors and centers/pharmacies steps of `GroupOnboardingPage` (currently
  layout-only per `family-groups` spec) to the real import/create flows above, replacing the
  "Omitir por ahora"-only placeholder while keeping skip available.

## Capabilities

### New Capabilities
- `repositories-group`: per-group repositories for doctors, medical centers, pharmacies, and
  insurers — import from the universal catalog, create-with-propagation, duplicate
  detection, and group-scoped deactivation. Explicitly excludes `Specialty` (remains a
  SuperAdmin-only flat catalog, per `04-diseño-de-datos.md` § 2.10).

### Modified Capabilities
- `family-groups`: the "Group onboarding flow" requirement's doctors and centers/pharmacies
  steps change from layout-only placeholders to real import/create functionality backed by
  `repositories-group`.

## Impact

- New directory `src/features/repositories-group/` (services, hooks, components).
- `GroupOnboardingPage` (from `07-feature-family-groups`) updated to use the new components
  instead of its placeholder steps.
- New route `/admin/repositories` (Admin role).
- New i18n keys under `repositories.*` in `en.json`/`es.json`.
- No changes to `src/mock/` seed shapes — `GroupDoctor`/`GroupMedicalCenter`/`GroupPharmacy`/
  `GroupInsurer` and the `originGroupId` field on universal entities already exist.
- Reuses existing components without modification: `DoctorForm`, `MedicalCenterForm`,
  `PharmacyForm`, `InsurerForm`, `Command`/`Popover`, `ConfirmModal`, `StatusBadge`.
