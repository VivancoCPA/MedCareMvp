## Context

`repositories-universal` (change 05) established the universal catalogs and their
service/hook/component pattern (list + search/filter + modal form + Zod validation +
confirm-guarded deactivate/reactivate). `family-groups` (change 07) established the
"active group in context" mechanism used by `GroupPage` and introduced ADR-014 (an Admin
may administer multiple groups; every group has its own independent state — never an
aggregated "all of this Admin's groups" view). The four group repository entities
(`GroupDoctor`, `GroupMedicalCenter`, `GroupPharmacy`, `GroupInsurer`) and the
`originGroupId` field on universal entities already exist in `data-model.md` and are
unused until this change. `Specialty` has no group repository — it stays a flat,
SuperAdmin-only catalog.

## Goals / Non-Goals

**Goals:**
- Let an Admin build, per group, a repository of doctors/medical centers/pharmacies/
  insurers by importing existing universal-catalog records or creating new ones.
- Automatically propagate group-created entries to the universal catalog with
  `originGroupId` set (ADR-004), with case-insensitive duplicate-by-name detection before
  creating a new universal record.
- Let an Admin deactivate a group's repository entry without affecting the universal
  record or any other group's repository.
- Connect the two group-onboarding steps that are currently layout-only placeholders to
  this real functionality.
- Keep every query/mutation scoped to an explicit `groupId` (ADR-014) — never `adminId`.

**Non-Goals:**
- A `GroupSpecialty` entity or any group-level repository for specialties.
- Any change to the universal catalog's own CRUD behavior beyond the propagation already
  defined by ADR-004.
- A combined view across a single Admin's multiple groups.
- Edit of universal records from the group view (only the universal-catalog view can edit
  a universal record; the group view can only import, create-with-propagation, or
  deactivate-in-group).
- SuperAdmin approval/notification workflow for propagated entries — propagation is
  automatic per ADR-004.

## Decisions

**One service file, one entity-type discriminator, not four parallel services.**
`group-repositories.service.ts` takes an explicit `entityType: 'doctor' | 'medicalCenter'
| 'pharmacy' | 'insurer'` parameter on every function rather than four separate
per-entity service modules. This mirrors the "common repository service contract"
pattern from `repositories-universal` and avoids near-duplicate service code; `entityType`
is checked explicitly in every branch (R6), never inferred from object shape.

**Group repository rows stay reference-only (ADR-003).** `GroupDoctor` etc. store only
`(id, groupId, entityId, isActive, createdAt)` — no denormalized copy of the universal
record's fields. Reads join in-memory against the universal catalog, the same resolution
pattern change 05 already uses for `specialtyId` → specialty name.

**One page with tabs, not four pages.** `GroupRepositoriesPage` renders four tabs
(Médicos / Centros médicos / Farmacias / Aseguradoras), each an instance of a single
`GroupRepositoryTab` parameterized by `entityType` — avoids four nearly-identical pages
and keeps the header actions ("Importar existente" / "Crear nuevo") consistent.

**Reuse the change-05 forms unmodified.** `CreateOwnEntryModal` wraps the existing
`DoctorForm`/`MedicalCenterForm`/`PharmacyForm`/`InsurerForm` and their Zod schemas as-is,
adding only the duplicate-check step around submission. No form is forked or duplicated.

**Duplicate check runs against the full universal catalog, not just the group's current
repository.** A name collision anywhere in the universal catalog (including entries never
imported into this group) must surface `DuplicateFoundDialog`, since creating a same-named
universal record would otherwise silently fragment the catalog.

**Import candidates exclude entries already active in the group, not the whole
catalog.** `getImportCandidates(groupId, entityType)` returns universal-catalog entries
that are active and not already present as an active row in this group's repository —
this lets a previously-deactivated-then-reactivatable entry still surface through the
normal import flow (re-importing reactivates the existing row instead of duplicating it).

**Onboarding reuses the same modals inline rather than forking simplified versions.**
`OnboardingStepDoctors` (and the centers/pharmacies step) render `ImportEntityModal` +
`CreateOwnEntryModal` the same way `GroupRepositoryTab` does, keeping "Omitir por ahora"
available. This removes the now-obsolete "Podrás agregar tus médicos aquí muy pronto..."
placeholder copy and the "layout-only" scenario in the `family-groups` spec.

## Risks / Trade-offs

- **[Risk]** Forgetting to invalidate `['importCandidates', groupId, entityType]` after
  `createGroupOwnEntry` would let the just-created universal record still appear as an
  import candidate in the same group. → **Mitigation:** explicit invalidation table in the
  hooks (mirrors the change-07 sync-02 pattern that caught this class of bug before).
- **[Risk]** Multi-select import (several entities at once) could partially fail mid-batch.
  → **Mitigation:** each selected id calls `importToGroupRepository` independently; a
  failure on one does not roll back the others, and the table refresh reflects whatever
  succeeded (consistent with change 05's per-record mutation error handling, no new batch
  transaction concept introduced).
- **[Trade-off]** Reactivating an inactive group row on re-import (instead of always
  inserting a new row) means `createdAt` on that row does not reflect the most recent
  import date. Accepted: avoids duplicate rows per (groupId, entityId), which matters more
  for correctness than the row's created timestamp.
