# repositories-group

## Purpose

Per-group repositories for doctors, medical centers, pharmacies, and insurers,
letting each Admin build their own group's medical network by importing
existing records from the universal catalog (`repositories-universal`) or
creating new ones — with automatic bidirectional propagation to the universal
catalog (ADR-004) and case-insensitive duplicate detection. `Specialty` is
explicitly excluded: it has no group repository and remains a flat,
SuperAdmin-only catalog. Every operation is scoped by an explicit `groupId`,
never an `adminId`, since a single Admin may administer more than one group
(ADR-014) and each group's repository is independent.

## Requirements

### Requirement: Admin-only access scoped to an explicit group
The `/admin/repositories` route SHALL be reachable only by users with role `admin`, and every group-repository read or mutation SHALL receive an explicit `groupId` parameter identifying the group currently in focus — never an `adminId` used as a stand-in for "all groups this Admin manages" (ADR-014).

#### Scenario: Admin navigates to the group repositories page
- **WHEN** a user with role `admin` navigates to `/admin/repositories`
- **THEN** `GroupRepositoriesPage` renders, scoped to the group currently in focus

#### Scenario: Non-Admin is blocked
- **WHEN** a user with role `superadmin` or `member` attempts to navigate to `/admin/repositories`
- **THEN** the existing role guard denies access

#### Scenario: Switching the group in focus scopes all repository data to the new group
- **WHEN** the Admin switches the group in focus to a different group they administer
- **THEN** `GroupRepositoriesPage` shows that group's own repository entries, not the previous group's

### Requirement: No group repository for Specialty
`Specialty` SHALL NOT have a group repository entity, tab, or service function — it remains a flat catalog administered only by the SuperAdmin.

#### Scenario: Specialty is absent from the group repositories page
- **WHEN** the Admin views `GroupRepositoriesPage`
- **THEN** only four tabs render (Médicos, Centros médicos, Farmacias, Aseguradoras) — no "Especialidades" tab exists

### Requirement: Common group repository service contract
The group repository service SHALL expose one contract shared by all four entity types (`doctor`, `medicalCenter`, `pharmacy`, `insurer`), with `entityType` checked explicitly in every branch rather than inferred from the shape of the data.

#### Scenario: getGroupRepository returns only active entries resolved against the universal catalog
- **WHEN** `getGroupRepository(groupId, entityType)` is called
- **THEN** it resolves with only the group's `isActive: true` rows, each joined in-memory against its corresponding universal-catalog record

#### Scenario: getImportCandidates excludes entries already active in this group
- **WHEN** `getImportCandidates(groupId, entityType)` is called
- **THEN** it resolves with active universal-catalog records of that type that do not already have an active row in this group's repository

#### Scenario: Group repository rows store references only
- **WHEN** any group repository row (`GroupDoctor`, `GroupMedicalCenter`, `GroupPharmacy`, `GroupInsurer`) is created
- **THEN** it stores only `id`, `groupId`, the universal entity id, `isActive`, and `createdAt` — no denormalized copy of the universal record's own fields

### Requirement: Import from universal catalog
The Admin SHALL be able to import one or more existing universal-catalog records into their group's repository via a multi-select modal.

#### Scenario: Selecting candidates and confirming imports them
- **WHEN** the Admin selects one or more entries in `ImportEntityModal` and confirms
- **THEN** `importToGroupRepository` is called for each selected entity id, and the group repository table refreshes to include them

#### Scenario: Re-importing a previously deactivated entry reactivates it
- **WHEN** `importToGroupRepository` is called for an entity that already has an inactive row for this group
- **THEN** that existing row's `isActive` becomes `true` instead of a new row being created

#### Scenario: Imported entries no longer appear as import candidates
- **WHEN** an entity has been successfully imported into a group's repository
- **THEN** it no longer appears in that group's `getImportCandidates` results

### Requirement: Create own entry with universal catalog propagation
The Admin SHALL be able to create a new entry directly from a group repository tab using the same form used by the universal catalog; on save, the system SHALL check for a case-insensitive name match against the full universal catalog before creating a new universal record.

#### Scenario: No duplicate found creates and propagates
- **WHEN** the Admin submits `CreateOwnEntryModal` with a name that has no case-insensitive match anywhere in the universal catalog
- **THEN** `createGroupOwnEntry` creates a new universal record with `originGroupId` set to this group's id, plus a group repository row pointing to it

#### Scenario: Duplicate found prompts a choice
- **WHEN** `checkDuplicateByName` finds a case-insensitive name match anywhere in the universal catalog (not only within this group's current repository)
- **THEN** `DuplicateFoundDialog` opens instead of saving directly, asking whether to use the existing record or create a new one anyway

#### Scenario: Choosing to use the existing record imports it
- **WHEN** the Admin chooses "Usar existente" in `DuplicateFoundDialog`
- **THEN** `importToGroupRepository` is called with the matched universal record's id, and no new universal record is created

#### Scenario: Choosing to create anyway allows a duplicate name
- **WHEN** the Admin chooses "Crear nuevo de todos modos" in `DuplicateFoundDialog`
- **THEN** `createGroupOwnEntry` proceeds and creates a new universal record even though its name duplicates an existing one

### Requirement: Deactivate within a group only
The Admin SHALL be able to deactivate a group repository entry from the group's table, and this action SHALL never change the corresponding universal record's `isActive` status.

#### Scenario: Deactivating a group entry requires confirmation
- **WHEN** the Admin clicks "Desactivar" on a group repository row
- **THEN** `ConfirmModal` opens before `deactivateGroupRepositoryEntry` is called

#### Scenario: Confirming deactivates only the group row
- **WHEN** the Admin confirms the deactivation prompt
- **THEN** that group repository row's `isActive` becomes `false`, the row disappears from `getGroupRepository` for this group, and the corresponding universal record's `isActive` is unchanged

#### Scenario: Deactivated entry remains usable by other groups
- **WHEN** a group repository entry has been deactivated for one group
- **THEN** the same universal record remains available as an import candidate for any other group that has not imported it
