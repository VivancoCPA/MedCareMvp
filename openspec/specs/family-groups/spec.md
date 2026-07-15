# family-groups

## Purpose

Grupos familiares (MÓD-04): creación de grupo, onboarding, gestión de
miembros con y sin cuenta a través de `groups.service.ts`, remoción de
miembros, la transferencia implícita cuando un miembro crea su propio grupo,
y el flag de compartir historial de salud con un grupo anterior. Reemplaza a
`GroupMembersPage` como dueño único de los datos de `Group` y
`NonAccountMember` en `/admin/group`.

## Requirements

### Requirement: Group creation eligibility and effects
A user with no active group (`groupId === null`) SHALL be able to create a family group by submitting a name. On success, the system SHALL create a `Group` with `adminId` set to that user, set the user's `groupId` to the new group and `role` to `'admin'` (if not already), and create an empty `HealthProfile` for that user as a `'user'` member.

#### Scenario: Ungrouped user creates a group
- **WHEN** a user with `groupId === null` submits a valid group name
- **THEN** a new `Group` is created with that user as `adminId`, the user's `groupId` is set to the new group's id, and an empty `HealthProfile` is created for them

#### Scenario: Non-admin role is promoted to admin
- **WHEN** a user with `role: 'member'` and no group creates a group
- **THEN** the user's `role` becomes `'admin'`

#### Scenario: Group creation redirects to onboarding
- **WHEN** a group is created successfully
- **THEN** the app navigates to `/admin/group/onboarding`

### Requirement: Member creating their own group leaves their current group
A user who already belongs to a group SHALL be able to create a new group of their own. Doing so SHALL show a warning naming their current group before proceeding, and on confirmation SHALL set `previousGroupId` to their current `groupId`, clear their membership in the old group, and then apply group creation exactly as for an ungrouped user.

#### Scenario: Warning names the current group before proceeding
- **WHEN** a user who belongs to group "Familia García" starts creating their own group
- **THEN** a warning modal states that creating a new group will remove them from "Familia García", requiring explicit confirmation to continue

#### Scenario: Confirming sets previousGroupId and leaves the old group
- **WHEN** the user confirms creating their own group
- **THEN** their `previousGroupId` is set to their prior `groupId`, they are removed from the old group's member list, and a new group is created with them as admin

#### Scenario: Cancelling the warning makes no changes
- **WHEN** the user dismisses or cancels the warning modal
- **THEN** no group is created and the user's `groupId`/`previousGroupId` are unchanged

### Requirement: Share health record with previous group toggle
`ShareHCToggle` SHALL render only when the logged-in user's `previousGroupId` is not `null`, and SHALL let the user reversibly set `shareHCWithPreviousGroup` without any additional confirmation step.

#### Scenario: Toggle hidden with no previous group
- **WHEN** a user's `previousGroupId` is `null`
- **THEN** `ShareHCToggle` does not render

#### Scenario: Toggle visible and reversible with a previous group
- **WHEN** a user's `previousGroupId` is not `null`
- **THEN** `ShareHCToggle` renders their current `shareHCWithPreviousGroup` value and switching it immediately persists the new value with no confirmation prompt

### Requirement: Group page access and member listing
The route `/admin/group` SHALL be reachable only by users with role `admin` and SHALL render `GroupPage`, showing the current group's name/header and a `MemberTable` listing every non-deleted `User` and `NonAccountMember` whose `groupId` matches the admin's group.

#### Scenario: Admin navigates to their group page
- **WHEN** an Admin navigates to `/admin/group`
- **THEN** the page renders the group's name and the result of `groupsService.getGroupMembers(groupId)`

#### Scenario: Member table includes both account and non-account members
- **WHEN** a group has both `User` and `NonAccountMember` records with matching `groupId`
- **THEN** both appear as rows in `MemberTable`, visually distinguished by member type

#### Scenario: Soft-deleted members are excluded
- **WHEN** a `User` or `NonAccountMember` has a non-null `deletedAt`, or a `User` has `groupId` cleared
- **THEN** that record does not appear in `getGroupMembers`'s result

#### Scenario: Admin (group owner) appears in their own member table
- **WHEN** `getGroupMembers` is called for a group
- **THEN** the group's own admin appears as a row like any other member, with an "Admin" badge, with no special filtering or exclusion

### Requirement: Groups service contract
`groupsService` SHALL expose `createGroup`, `addAccountMember`, `createAccountMember`, `addNonAccountMember`, `removeMember`, `toggleShareHCWithPreviousGroup`, and `getGroupMembers`, each returning a `Promise` and applying the configured simulated mock delay. It SHALL be the only file in `src/features/groups/` that imports from `src/mock`, and it SHALL be the only file (in any feature) that mutates `groupId`, `previousGroupId`, `shareHCWithPreviousGroup`, or group-driven `role` promotion on a `User` record.

#### Scenario: getGroupMembers filters by groupId and excludes deleted
- **WHEN** `getGroupMembers(groupId)` is called
- **THEN** it resolves with every `User` and `NonAccountMember` whose `groupId` equals the given id and whose `deletedAt` is `null`

#### Scenario: Group-membership fields are never mutated outside groupsService
- **WHEN** any code path changes a `User`'s `groupId`, `previousGroupId`, or `shareHCWithPreviousGroup`
- **THEN** that mutation happens inside `groupsService`, never inside `usersService` or a component/hook directly

### Requirement: Add member with an existing account by email
`groupsService.addAccountMember({ groupId, email })` SHALL look up a user by email. If found and ungrouped (`groupId === null`), it SHALL attach them to the group and create an empty `HealthProfile`. If found but already in a group, it SHALL reject with an error. If not found, it SHALL reject in a way the UI distinguishes from "already in a group", so the caller can offer to create a new account instead.

#### Scenario: Existing ungrouped user is attached
- **WHEN** `addAccountMember` is called with an email belonging to a user with `groupId === null`
- **THEN** that user's `groupId` is set to the target group and an empty `HealthProfile` is created for them

#### Scenario: Already-grouped user is rejected
- **WHEN** `addAccountMember` is called with an email belonging to a user who already has a non-null `groupId`
- **THEN** the call rejects with a "ya pertenece a otro grupo familiar" error and no field is changed

#### Scenario: Unknown email is reported distinctly
- **WHEN** `addAccountMember` is called with an email matching no user
- **THEN** the call rejects with a "no se encontró ningún usuario" error, and `AddAccountMemberForm` offers to create a new account for that email instead of a dead-end message

### Requirement: Create a brand-new account for a group member
`groupsService.createAccountMember({ groupId, adminId, email, firstName, lastName, birthDate, gender, phone, avatarUrl })` SHALL create a new `User` with `role: 'member'`, `groupId` set to the given group, and `originAdminId` set to the given admin, by delegating account creation (temp password, email-uniqueness) to `usersService.create()`, and SHALL create an empty `HealthProfile` for the new user.

#### Scenario: New account is created already attached to the group
- **WHEN** `createAccountMember` is called with a new email and profile fields
- **THEN** a `User` is created with the given `groupId`, `role: 'member'`, `mustChangePassword: true`, and an empty `HealthProfile`

#### Scenario: Duplicate email is still rejected
- **WHEN** `createAccountMember` is called with an email already belonging to another non-deleted user
- **THEN** the call rejects with the same `EMAIL_TAKEN` error `usersService.create()` raises, and no user or `HealthProfile` is created

### Requirement: Add member without an account
`groupsService.addNonAccountMember({ groupId, firstName, lastName, memberType, birthDate, gender, breed, bloodType })` SHALL create a `NonAccountMember` linked to the group and an empty `HealthProfile` for them. `gender` SHALL always be required (defaulting the form to `'unspecified'` for non-human types); `breed` SHALL only be a meaningful input when `memberType` is `'pet'`.

#### Scenario: Non-account member is created with a health profile
- **WHEN** `addNonAccountMember` is called with valid data
- **THEN** a `NonAccountMember` is created with the given `groupId` and an empty `HealthProfile` is created for them with `memberType: 'nonAccount'`

#### Scenario: Non-account member is visible to every account-holding member of the group
- **WHEN** a `NonAccountMember` is added to a group
- **THEN** it appears in `getGroupMembers` for that group, visible to any account-holding member who views it

### Requirement: Member removal blocks self-removal of the group admin
`groupsService.removeMember({ groupId, memberId, memberType })` SHALL reject when `memberType === 'user'` and `memberId` equals the group's `adminId`. For any other member, it SHALL clear `groupId` (for a `User`) or set `deletedAt` (for a `NonAccountMember`), never physically deleting the record, and SHALL preserve all of that member's clinical history.

#### Scenario: Admin cannot remove themselves
- **WHEN** `removeMember` is called with `memberId` equal to the group's own `adminId` and `memberType: 'user'`
- **THEN** the call rejects with a "transfiere la administración primero" error and no field is changed

#### Scenario: Removing a User clears groupId without deleting history
- **WHEN** `removeMember` is called for a non-admin `User` member
- **THEN** that user's `groupId` becomes `null`, their record and all linked clinical history remain intact, and they no longer appear in `getGroupMembers` for that group

#### Scenario: Removing a NonAccountMember soft-deletes it
- **WHEN** `removeMember` is called with `memberType: 'nonAccount'`
- **THEN** that record's `deletedAt` is set to the current timestamp, and it no longer appears in `getGroupMembers` for that group

#### Scenario: Removal always requires confirmation
- **WHEN** the Admin clicks "Remover del grupo" on any member row
- **THEN** a `ConfirmModal` opens before `removeMember` is called, and cancelling it calls no mutation

### Requirement: Group onboarding flow
`/admin/group/onboarding` SHALL render a 3-step stepper (doctors, centers/pharmacies, members), each step individually skippable via "Omitir por ahora" without discarding progress already made in a prior step, ending with navigation back to `/admin/group` once every step is completed or skipped.

#### Scenario: Each step can be skipped independently
- **WHEN** the Admin clicks "Omitir por ahora" on the doctors step
- **THEN** the stepper advances to the centers/pharmacies step without discarding any group data already entered

#### Scenario: Completing or skipping all steps returns to the group page
- **WHEN** the Admin completes or skips the third (members) step
- **THEN** the app navigates to `/admin/group`

#### Scenario: Onboarding is re-enterable
- **WHEN** the Admin navigates to `/admin/group/onboarding` again after finishing it once
- **THEN** the stepper renders from its first step, usable again with no error

#### Scenario: Doctors step supports importing and creating, in addition to skipping
- **WHEN** the Admin views the doctors onboarding step
- **THEN** the Admin can import existing doctors from the universal catalog or create a new doctor with universal-catalog propagation, and can still click "Omitir por ahora" to advance without adding any

#### Scenario: Centers/pharmacies step supports importing and creating, in addition to skipping
- **WHEN** the Admin views the centers/pharmacies onboarding step
- **THEN** the Admin can import existing medical centers and pharmacies from the universal catalog or create new ones with universal-catalog propagation, and can still click "Omitir por ahora" to advance without adding any
