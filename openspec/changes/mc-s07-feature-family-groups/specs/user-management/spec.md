## REMOVED Requirements

### Requirement: Admin group-members access scoped to origin and unclaimed pool
**Reason**: `/admin/group` is now served by `GroupPage` (capability `family-groups`), scoped by real `groupId` membership via `groupsService.getGroupMembers(groupId)` instead of the `originAdminId`/unclaimed-pool heuristic. That heuristic only existed as a stand-in until a real `Group` data layer shipped.
**Migration**: See `family-groups`'s "Group page access and member listing" requirement. Members created going forward get a real `groupId` at creation time (see `family-groups`'s "Create a brand-new account for a group member").

### Requirement: Admin edit of group members
**Reason**: The Admin group-members table (`GroupMembersList`) is deleted along with `GroupMembersPage`; its listing and per-row actions are superseded by `MemberTable` in `family-groups`, which also handles non-account members and removal.
**Migration**: `UserFormModal`'s `edit-admin` mode (unchanged, see "User form modal field visibility by mode" below) is now opened from `GroupPage` instead of `GroupMembersPage`. The field-editing rules it specifies are unchanged.

### Requirement: Admin-initiated user creation
**Reason**: `GroupMembersPage`'s "Nuevo usuario" button is removed along with the page. The equivalent capability — an Admin creating a brand-new account for someone joining their group — moves to `family-groups`'s "Create a brand-new account for a group member" requirement, which additionally sets a real `groupId` at creation (the old flow never did).
**Migration**: Use `groupsService.createAccountMember(...)`, invoked from `GroupPage`'s "Con cuenta" add-member flow, in place of `GroupMembersPage`'s create button.

## MODIFIED Requirements

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
