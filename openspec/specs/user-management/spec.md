# user-management

## Purpose

Módulo de gestión de usuarios centrado en la vista del SuperAdmin: administra
la lista completa de usuarios (crear, editar, desactivar/reactivar, buscar y
filtrar). La gestión de miembros de un grupo por parte del Admin (listado,
edición, alta y remoción) ahora vive en la capability `family-groups`.

## Requirements

### Requirement: SuperAdmin-only user list access
The route `/superadmin/users` SHALL be reachable only by users with role `superadmin` and SHALL render a list of every user in the system.

#### Scenario: SuperAdmin navigates to the user list
- **WHEN** a user with role `superadmin` navigates to `/superadmin/users`
- **THEN** the user list page renders with all users from `usersService.getAll()`

#### Scenario: Non-SuperAdmin is blocked
- **WHEN** a user with role `admin` or `member` attempts to navigate to `/superadmin/users`
- **THEN** the existing role guard denies access (unchanged behavior — no route-level change in this capability)

### Requirement: Users service contract
`usersService` SHALL expose `getAll()`, `getById(id)`, `create(data)`, `update(id, data)`, `deactivate(id)`, `reactivate(id)`, each returning a `Promise` and applying the configured simulated mock delay. It SHALL be the only file in `src/features/user-management/` that imports from `src/mock`. `create(data)` SHALL accept an optional `groupId` in its DTO, persisting whatever value it is given (or `null`) without inferring one itself.

#### Scenario: getAll returns every user regardless of status or group
- **WHEN** `getAll()` is called
- **THEN** it resolves with both active and inactive users, across every group and with no group

#### Scenario: deactivate never sets deletedAt
- **WHEN** `deactivate(id)` is called
- **THEN** the matching user's `isActive` becomes `false` and `updatedAt` is refreshed to the current timestamp
- **AND** the user's `deletedAt` remains unchanged (never set to a non-null value)

#### Scenario: reactivate restores active status
- **WHEN** `reactivate(id)` is called on a user with `isActive: false`
- **THEN** the matching user's `isActive` becomes `true` and `updatedAt` is refreshed

#### Scenario: create persists whatever groupId it is given
- **WHEN** `create(data)` is called with a non-null `groupId` in the DTO
- **THEN** the new user's `groupId` is set to that value, and when omitted or `null` the new user's `groupId` is `null`

### Requirement: Email uniqueness enforced on create and edit
`usersService.create()` and `usersService.update()` SHALL reject an email that already belongs to a different, non-deleted user.

#### Scenario: Create with a duplicate email is rejected
- **WHEN** `create(data)` is called with an `email` matching an existing user's `email`
- **THEN** the promise rejects with an `EMAIL_TAKEN` error and no user is created

#### Scenario: Edit to a duplicate email is rejected
- **WHEN** `update(id, data)` is called with an `email` matching a different existing user's `email`
- **THEN** the promise rejects with an `EMAIL_TAKEN` error and the record is not changed

#### Scenario: Edit keeping the same email succeeds
- **WHEN** `update(id, data)` is called with the user's own current `email` unchanged
- **THEN** the update succeeds (the user's own record is excluded from the uniqueness check)

### Requirement: Temporary password on user creation
`usersService.create()` SHALL generate a temporary password satisfying the platform's password rules (8+ characters, at least one uppercase, one lowercase, one number, one special character) and SHALL set `mustChangePassword: true` on the new user.

#### Scenario: New user is created with mustChangePassword true
- **WHEN** a user is created via `usersService.create()`
- **THEN** the resulting user has `mustChangePassword: true` and a `passwordHash` meeting the password rules

#### Scenario: Create success shows two toasts
- **WHEN** the SuperAdmin submits the create-user form successfully
- **THEN** a success toast confirms creation and a second toast confirms the simulated temporary-password email

### Requirement: SuperAdmin search and filters
The SuperAdmin user list SHALL filter its full in-memory dataset by name-or-email substring (case-insensitive, 300ms debounce), by role (`Todos`/`SuperAdmin`/`Admin`/`Miembro`), and by status (`Todos`/`Activo`/`Inactivo`), computed with `useMemo` in the list component.

#### Scenario: Search matches name or email
- **WHEN** the user types a substring that matches a user's first name, last name, or email
- **THEN** the table shows only users matching that substring, after a 300ms debounce

#### Scenario: Role filter narrows results
- **WHEN** the user selects "Admin" in the role filter
- **THEN** the table shows only users with `role: 'admin'`

#### Scenario: Search, role, and status filters combine
- **WHEN** a search term, a non-default role filter, and a non-default status filter are all active
- **THEN** the table shows only users matching all three conditions

#### Scenario: No matches shows empty state
- **WHEN** the combination of filters matches zero users
- **THEN** the table is replaced by the shared `EmptyState` component

### Requirement: SuperAdmin table pagination
The SuperAdmin user list SHALL paginate its filtered results client-side using the shared `usePagination` hook with a page size of 10.

#### Scenario: More than 10 matching users are paginated
- **WHEN** the filtered result set contains more than 10 users
- **THEN** only 10 are shown per page, with pagination controls to move between pages

### Requirement: User form modal field visibility by mode
`UserFormModal` SHALL render three distinct field-visibility modes: create (SuperAdmin), edit-superadmin, and edit-admin, sharing one component.

#### Scenario: Create mode shows all fields editable
- **WHEN** the SuperAdmin opens the create-user modal
- **THEN** firstName, lastName, email, role, birthDate, gender, and phone are all editable, and no `groupId` field is shown

#### Scenario: Edit-superadmin mode allows editing email and role
- **WHEN** the SuperAdmin opens the edit modal for an existing user
- **THEN** email and role are editable, `groupId` is not shown anywhere in the form, and `mustChangePassword` is not shown

#### Scenario: Edit-admin mode disables email and role
- **WHEN** an Admin opens the edit modal for a member of their own group
- **THEN** firstName, lastName, phone, birthDate, and gender are editable, and email and role are rendered disabled with an explanatory tooltip

### Requirement: Create and edit validation
User create and edit SHALL validate input with Zod (React Hook Form), keeping the modal open with an inline error on any invalid or missing required field, and keeping the modal open with a toast on any backend mutation failure.

#### Scenario: Missing required field blocks submit
- **WHEN** the user submits the create or edit form with a required field empty
- **THEN** an inline error appears under that field and the modal remains open (no toast, no mutation call)

#### Scenario: Duplicate email surfaces as a field error
- **WHEN** the create or update mutation rejects with `EMAIL_TAKEN`
- **THEN** an inline error appears under the email field and the modal remains open with the user's other input intact

#### Scenario: Successful edit updates the table
- **WHEN** the user changes a field and submits a valid edit
- **THEN** the record is updated, the modal closes, the table reflects the change, and a success toast is shown

### Requirement: Admin-created-without-group warning
When the SuperAdmin selects role `admin` in the create-user form, the modal SHALL show a non-blocking informational alert stating the new Admin will have no group until they create one.

#### Scenario: Warning appears when role is Admin
- **WHEN** the SuperAdmin selects "Admin" in the role field of the create modal
- **THEN** an informational alert appears below the role field

#### Scenario: Warning does not block submission
- **WHEN** the role field is "Admin" and the warning alert is visible
- **THEN** the user can still submit the form successfully with no additional required field

### Requirement: Deactivate and reactivate via confirmation
Both "Desactivar" and "Reactivar" actions in the SuperAdmin table SHALL require confirmation via the shared `ConfirmModal` before their respective mutation runs.

#### Scenario: Deactivate requires confirmation
- **WHEN** the SuperAdmin clicks "Desactivar" on an active, non-superadmin, non-self user
- **THEN** `ConfirmModal` opens with a message naming the user before any mutation is called

#### Scenario: Confirming deactivation applies it and sends a second toast
- **WHEN** the SuperAdmin confirms the deactivate `ConfirmModal`
- **THEN** the user's status badge changes to "Inactivo", a deactivation success toast is shown, and a second toast confirms the simulated PDF summary email

#### Scenario: Reactivate also requires confirmation
- **WHEN** the SuperAdmin clicks "Reactivar" on an inactive user
- **THEN** `ConfirmModal` opens with a message naming the user before any mutation is called

#### Scenario: Cancelling either action applies nothing
- **WHEN** the SuperAdmin dismisses or cancels the deactivate or reactivate `ConfirmModal`
- **THEN** no mutation is called and the user's status is unchanged

### Requirement: SuperAdmin self-deactivation and peer-superadmin protection
The SuperAdmin table SHALL disable the "Desactivar" action for the logged-in SuperAdmin's own row with an explanatory tooltip, and SHALL omit the "Desactivar" action entirely for rows belonging to other users with role `superadmin`.

#### Scenario: Logged-in SuperAdmin cannot deactivate themselves
- **WHEN** the SuperAdmin table renders the row for the currently logged-in SuperAdmin
- **THEN** the "Desactivar" button on that row is disabled and shows a tooltip explaining why

#### Scenario: Other SuperAdmin rows have no deactivate action
- **WHEN** the SuperAdmin table renders a row for a different user with role `superadmin`
- **THEN** no "Desactivar" or "Reactivar" action is shown for that row — only "Editar"

### Requirement: Group name resolution
The SuperAdmin table's "Grupo" column SHALL display the resolved group name via `usersService.getGroupName(groupId)` (falling back to a "sin grupo" label when `groupId` is `null`), never the raw `groupId`.

#### Scenario: User with a group shows the group's name
- **WHEN** a user's `groupId` matches an existing group
- **THEN** the "Grupo" column shows that group's `name`, not its id

#### Scenario: User without a group shows the fallback label
- **WHEN** a user's `groupId` is `null`
- **THEN** the "Grupo" column shows the localized "sin grupo" label

### Requirement: Dates rendered via shared formatter
Every date shown in the SuperAdmin user table SHALL be formatted with the shared `formatDate()` utility, never formatted inline in a component.

#### Scenario: Created-at column uses the shared formatter
- **WHEN** the SuperAdmin table renders the "Creado" column for a user
- **THEN** the displayed value is the output of `formatDate(user.createdAt)`

### Requirement: User avatar upload and display
`CreateUserDTO` and `UpdateUserDTO` SHALL accept an optional `avatarUrl`. `UserFormModal` SHALL let the user pick an image file in every mode (create, edit-superadmin, edit-admin), preview it as a circular avatar with a simulated `URL.createObjectURL()` upload, fall back to initials when no avatar is set, and allow removing the selected avatar before saving.

#### Scenario: Selecting a file updates the preview
- **WHEN** the user selects an image file in the avatar input
- **THEN** the circular preview updates to show that image via a simulated object URL

#### Scenario: No avatar falls back to initials
- **WHEN** a user has no `avatarUrl`
- **THEN** the form preview and any table row show the user's initials on a neutral background instead of an image

#### Scenario: Removing the avatar clears the field
- **WHEN** the user clicks "Quitar foto" after selecting an avatar
- **THEN** `avatarUrl` is cleared and the preview reverts to the initials fallback

### Requirement: Avatar column in user tables
The SuperAdmin user table SHALL show a circular avatar (or initials fallback) as the first column of each row.

#### Scenario: Table row shows uploaded avatar
- **WHEN** a user has a non-null `avatarUrl`
- **THEN** the table's avatar column renders that image at 32×32px, rounded-full

#### Scenario: Table row shows initials fallback
- **WHEN** a user's `avatarUrl` is `null`
- **THEN** the table's avatar column renders the user's initials on `bg-[var(--color-surface-strong)]`

### Requirement: User origin tracking and propagation badge
Every user SHALL carry an `originAdminId` field: `null` when created by a SuperAdmin, or the creating Admin's id when created by that Admin. `usersService.create()` SHALL persist whatever `originAdminId` it is given in the DTO and SHALL NOT infer it itself. The SuperAdmin table SHALL show an "Origen" column with a "Propagado" badge (`bg-orange-100 text-orange-800`) when `originAdminId` is set, and a "SuperAdmin" badge (`bg-gray-100 text-gray-600`) when it is `null`.

#### Scenario: SuperAdmin-created user shows the SuperAdmin badge
- **WHEN** a user's `originAdminId` is `null`
- **THEN** the "Origen" column shows the "SuperAdmin" badge

#### Scenario: Admin-created user shows the Propagado badge
- **WHEN** a user's `originAdminId` is set to an Admin's id
- **THEN** the "Origen" column shows the "Propagado" badge

#### Scenario: originAdminId is never assigned by the form component
- **WHEN** a user is created from either `UserListPage` (SuperAdmin) or `GroupPage`'s add-member flow (Admin, via `groupsService.createAccountMember`)
- **THEN** the calling page or service — not `UserFormModal` — supplies `originAdminId` (`null` for SuperAdmin, `currentUser.id` for Admin) on the create DTO
