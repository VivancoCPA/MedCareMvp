## MODIFIED Requirements

### Requirement: Deactivate and reactivate via confirmation
Each catalog's table row SHALL offer a "Desactivar" action (for active records) or "Reactivar" action (for inactive records), and both SHALL require confirmation via the shared `ConfirmModal` before the mutation runs.

#### Scenario: Deactivate requires confirmation
- **WHEN** the user clicks "Desactivar" on an active record
- **THEN** `ConfirmModal` opens with an entity-specific message before any mutation is called

#### Scenario: Confirming deactivation applies it
- **WHEN** the user confirms the `ConfirmModal` prompt
- **THEN** the record's status badge changes to "Inactivo" and a success toast is shown

#### Scenario: Cancelling deactivation applies nothing
- **WHEN** the user dismisses or cancels the `ConfirmModal` prompt
- **THEN** no mutation is called and the record's status is unchanged

#### Scenario: Reactivate requires confirmation
- **WHEN** the user clicks "Reactivar" on an inactive record
- **THEN** `ConfirmModal` opens with an entity-specific reactivation message before any
  mutation is called

#### Scenario: Confirming reactivation applies it
- **WHEN** the user confirms the reactivation `ConfirmModal` prompt
- **THEN** the record's status badge changes to "Activo" and a success toast is shown

#### Scenario: Cancelling reactivation applies nothing
- **WHEN** the user dismisses or cancels the reactivation `ConfirmModal` prompt
- **THEN** no mutation is called and the record's status is unchanged

### Requirement: Doctor catalog fields and origin badge
The Doctor catalog SHALL manage `firstName`, `lastName`, `specialtyId` (required, single specialty), `phone` (optional), `email` (optional, validated as an email when present), and `avatarUrl` (optional), and SHALL display each doctor's propagation origin.

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

#### Scenario: Doctor with an avatar shows the photo
- **WHEN** a doctor's `avatarUrl` is not `null`
- **THEN** the table's avatar column and the form modal's preview both render the image
  circularly (32px in the table, 64px in the modal)

#### Scenario: Doctor without an avatar falls back to initials
- **WHEN** a doctor's `avatarUrl` is `null`
- **THEN** the table's avatar column and the form modal's preview both render a circular
  badge with the doctor's initials instead of an image

#### Scenario: Uploading a photo sets a local preview
- **WHEN** the user selects an image file in the Doctor form's photo field
- **THEN** the form's `avatarUrl` is set to a local object URL and the preview updates
  immediately, without a network request

#### Scenario: Removing the photo clears the field
- **WHEN** the user clicks "Quitar foto" after selecting an image
- **THEN** the form's `avatarUrl` is cleared and the preview reverts to initials

### Requirement: Insurer catalog fields
The Insurer catalog SHALL manage `name` (required), `emergencyPhone` (optional), `website` (optional, validated as a URL when present), and `logoUrl` (optional), with a valid website rendered as a clickable link that opens in a new tab.

#### Scenario: Website renders as a clickable link
- **WHEN** an insurer's `website` is not `null`
- **THEN** the "Sitio web" column renders an `<a>` element with `target="_blank"` pointing to
  that URL

#### Scenario: Invalid website URL is rejected
- **WHEN** the user submits the Insurer form with a `website` value that is not a valid URL
- **THEN** validation fails with the invalid-URL message and no record is created or updated

#### Scenario: Insurer with a logo shows the image
- **WHEN** an insurer's `logoUrl` is not `null`
- **THEN** the table's logo column and the form modal's preview both render the image with
  `object-contain` inside a rounded-rectangle frame (32×32px in the table, 64×48px in the
  modal) — never cropped to a circle

#### Scenario: Insurer without a logo falls back to initials
- **WHEN** an insurer's `logoUrl` is `null`
- **THEN** the table's logo column and the form modal's preview both render a rounded-
  rectangle badge with the insurer's initials instead of an image

## ADDED Requirements

### Requirement: Standardized table row height
Every catalog's `TableRow` SHALL render at a fixed height of 48px (`h-12`), consistently across all five catalogs.

#### Scenario: Row height is consistent across catalogs
- **WHEN** any of the five catalog tables renders a data row
- **THEN** the row's rendered height is 48px, matching every other catalog's row height

### Requirement: Legible status badge contrast
`StatusBadge` SHALL use an explicit text/background color pair for each status (active, inactive) that maintains readable contrast in both light and dark theme, independent of the `--color-signature-mint`/`--color-signature-forest` design tokens.

#### Scenario: Active badge is legible in light mode
- **WHEN** the app is in light theme and a record's `isActive` is `true`
- **THEN** the status badge renders with a text color that is clearly distinguishable from
  its background color

#### Scenario: Active badge is legible in dark mode
- **WHEN** the app is in dark theme and a record's `isActive` is `true`
- **THEN** the status badge renders with a text color that is clearly distinguishable from
  its background color

#### Scenario: Inactive badge is legible in both themes
- **WHEN** a record's `isActive` is `false`, in either light or dark theme
- **THEN** the status badge renders with a text color that is clearly distinguishable from
  its background color

### Requirement: Client-side pagination
Each catalog list SHALL paginate its filtered result set client-side at a fixed page size of 10 records, resetting to page 1 whenever the filtered set changes.

#### Scenario: Results beyond the page size are paginated
- **WHEN** a catalog's filtered result set has more than 10 records
- **THEN** the table shows only the first 10 records and pagination controls are visible

#### Scenario: Navigating to another page shows the next slice
- **WHEN** the user selects page 2 of the pagination controls
- **THEN** the table shows records 11–20 of the filtered set

#### Scenario: Changing the search or status filter resets to page 1
- **WHEN** the user is on page 2 or later and changes the search term or status filter
- **THEN** the table returns to page 1 of the newly filtered result set

#### Scenario: Pagination controls are hidden when unnecessary
- **WHEN** a catalog's filtered result set has 10 or fewer records
- **THEN** no pagination controls are rendered
