## ADDED Requirements

### Requirement: SuperAdmin-only access
The five universal-repository routes (`/superadmin/doctors`, `/superadmin/specialties`, `/superadmin/medical-centers`, `/superadmin/insurers`, `/superadmin/pharmacies`) SHALL be reachable only by users with role `superadmin`.

#### Scenario: SuperAdmin navigates to a catalog
- **WHEN** a user with role `superadmin` navigates to any of the five routes
- **THEN** the corresponding catalog list page renders

#### Scenario: Non-SuperAdmin is blocked
- **WHEN** a user with role `admin` or `member` attempts to navigate to any of the five routes
- **THEN** the existing role guard denies access (unchanged behavior — no route-level change
  in this capability)

### Requirement: Common repository service contract
Every catalog service (doctors, specialties, medical centers, insurers, pharmacies) SHALL expose exactly the same method contract: `getAll()`, `getById(id)`, `create(data)`, `update(id, data)`, `deactivate(id)`, `reactivate(id)`, each returning a `Promise` and each applying the configured simulated mock delay.

#### Scenario: getAll returns every record regardless of status
- **WHEN** `getAll()` is called on any of the five services
- **THEN** it resolves with both active and inactive records — no server-side filtering

#### Scenario: deactivate never sets deletedAt
- **WHEN** `deactivate(id)` is called on any of the five services
- **THEN** the matching record's `isActive` becomes `false` and `updatedAt` is refreshed to
  the current timestamp
- **AND** the record's `deletedAt` remains unchanged (never set to a non-null value)

#### Scenario: reactivate restores active status
- **WHEN** `reactivate(id)` is called on a record with `isActive: false`
- **THEN** the matching record's `isActive` becomes `true` and `updatedAt` is refreshed

#### Scenario: create and update apply to the in-memory seed only
- **WHEN** `create(data)` or `update(id, data)` is called on any of the five services
- **THEN** only that service's own mock seed array is read or mutated — no other service's
  seed array is imported or touched

### Requirement: Client-side search and status filtering
Each catalog list page SHALL filter its full in-memory dataset by name (case-insensitive substring match) and by status (`Todos` / `Activo` / `Inactivo`), computed with `useMemo` in the list component — never inside the service or hook layer.

#### Scenario: Search filters by name substring
- **WHEN** the user types a substring of a record's name into the search input
- **THEN** the table shows only records whose name contains that substring
  (case-insensitive), after a 300ms debounce

#### Scenario: Status filter narrows results
- **WHEN** the user selects "Inactivo" in the status filter
- **THEN** the table shows only records with `isActive: false`

#### Scenario: Search and status filter combine
- **WHEN** both a search term and a non-default status filter are active
- **THEN** the table shows only records matching both conditions

#### Scenario: No matches shows empty state
- **WHEN** the combination of search term and status filter matches zero records
- **THEN** the table is replaced by the shared `EmptyState` component

### Requirement: Create and edit via modal form
Each catalog SHALL provide a single modal (`Dialog`, `max-w-lg`) used for both creating and editing a record, validated with React Hook Form + Zod, with the `isActive` field never exposed as an editable form control.

#### Scenario: Create succeeds
- **WHEN** the user fills the required fields with valid data and submits the "Nuevo
  [entidad]" modal
- **THEN** a new record is created, the modal closes, the table refreshes to include it, and
  a success toast is shown

#### Scenario: Edit succeeds
- **WHEN** the user opens "Editar" on an existing record, changes a field, and submits
- **THEN** the record is updated, the modal closes, the table reflects the change, and a
  success toast is shown

#### Scenario: Validation error keeps modal open
- **WHEN** the user submits the form with an invalid or missing required field
- **THEN** an inline error appears under that field and the modal remains open (no toast, no
  mutation call)

#### Scenario: Mutation failure keeps modal open
- **WHEN** the create or update request rejects
- **THEN** an error toast is shown and the modal remains open with the user's input intact

### Requirement: Deactivate and reactivate via confirmation
Each catalog's table row SHALL offer a "Desactivar" action (for active records) or "Reactivar" action (for inactive records), and "Desactivar" SHALL require confirmation via the shared `ConfirmModal` before the mutation runs.

#### Scenario: Deactivate requires confirmation
- **WHEN** the user clicks "Desactivar" on an active record
- **THEN** `ConfirmModal` opens with an entity-specific message before any mutation is called

#### Scenario: Confirming deactivation applies it
- **WHEN** the user confirms the `ConfirmModal` prompt
- **THEN** the record's status badge changes to "Inactivo" and a success toast is shown

#### Scenario: Cancelling deactivation applies nothing
- **WHEN** the user dismisses or cancels the `ConfirmModal` prompt
- **THEN** no mutation is called and the record's status is unchanged

#### Scenario: Reactivate does not require confirmation
- **WHEN** the user clicks "Reactivar" on an inactive record
- **THEN** the record is reactivated immediately, without a confirmation step

### Requirement: Doctor catalog fields and origin badge
The Doctor catalog SHALL manage `firstName`, `lastName`, `specialtyId` (required, single specialty), `phone` (optional), and `email` (optional, validated as an email when present), and SHALL display each doctor's propagation origin.

#### Scenario: Table shows combined name and resolved specialty
- **WHEN** the Doctor table renders a row
- **THEN** the "Nombre" column shows `firstName` and `lastName` combined, and the
  "Especialidad" column shows the specialty's `name` resolved from `specialtyId` (not the
  raw id)

#### Scenario: Doctor created by SuperAdmin shows SuperAdmin origin
- **WHEN** a doctor's `originGroupId` is `null`
- **THEN** the "Origen" column shows "SuperAdmin" as plain text (no badge)

#### Scenario: Doctor propagated from a group shows Propagado badge
- **WHEN** a doctor's `originGroupId` is not `null`
- **THEN** the "Origen" column shows a "Propagado" badge using the
  `--color-signature-peach` token

#### Scenario: Specialty is required on create
- **WHEN** the user submits the Doctor form without selecting a specialty
- **THEN** validation fails with the required-field message and no record is created

### Requirement: Specialty catalog fields
The Specialty catalog SHALL manage `name` (required) and `description` (optional, free text), with descriptions longer than 60 characters truncated with "..." in the table.

#### Scenario: Long description is truncated in the table
- **WHEN** a specialty's `description` exceeds 60 characters
- **THEN** the table shows the first 60 characters followed by "..."

#### Scenario: Missing description renders a dash
- **WHEN** a specialty's `description` is `null`
- **THEN** the table shows "—" in the Descripción column

### Requirement: Medical center catalog fields
The Medical Center catalog SHALL manage `name` (required), `type` (required, one of `clinic`/`hospital`/`office`/`laboratory`/`other`), `address` (optional), and `phone` (optional), with `type` displayed as its translated label.

#### Scenario: Type renders translated label
- **WHEN** the Medical Center table renders a row with `type: 'clinic'`
- **THEN** the "Tipo" column shows "Clínica", not the raw enum value

#### Scenario: Type is required on create
- **WHEN** the user submits the Medical Center form without selecting a type
- **THEN** validation fails with the required-field message and no record is created

### Requirement: Insurer catalog fields
The Insurer catalog SHALL manage `name` (required), `emergencyPhone` (optional), and `website` (optional, validated as a URL when present), with a valid website rendered as a clickable link that opens in a new tab.

#### Scenario: Website renders as a clickable link
- **WHEN** an insurer's `website` is not `null`
- **THEN** the "Sitio web" column renders an `<a>` element with `target="_blank"` pointing to
  that URL

#### Scenario: Invalid website URL is rejected
- **WHEN** the user submits the Insurer form with a `website` value that is not a valid URL
- **THEN** validation fails with the invalid-URL message and no record is created or updated

### Requirement: Pharmacy catalog fields
The Pharmacy catalog SHALL manage `name` (required), `address` (optional), and `phone` (optional).

#### Scenario: Optional fields render a dash when absent
- **WHEN** a pharmacy's `address` or `phone` is `null`
- **THEN** the corresponding table column shows "—"
