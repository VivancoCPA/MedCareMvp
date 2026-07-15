## Why

`/superadmin/users` and `/admin/group` are still placeholders. SuperAdmin has no way to create,
edit, or disable platform accounts, and Admins have no way to see or edit the basic data of the
members already in their group. Without this module, no account other than the 6 hardcoded seed
users can ever exist, and `mc-s07-feature-family-groups` (which needs a real member list to
attach group management to) has nothing to build on.

## What Changes

- Add a SuperAdmin-only user list at `/superadmin/users`: search (name/email, debounced), filter
  by role and status, paginated table (page size 10), create/edit via modal, deactivate/reactivate
  via confirmation.
- Add an Admin-only "group members" list at `/admin/group`: a read-only-scoped table of the
  members already in the Admin's own group, with edit (no create, no deactivate — SuperAdmin-only
  actions). This is a minimal placeholder table; full group management (add/remove members,
  members without an account, repositories) is out of scope and lands in
  `mc-s07-feature-family-groups` (D1).
- One shared `UserFormModal` covers three modes: SuperAdmin-create, SuperAdmin-edit (email and
  role editable, `groupId` read-only — D2), and Admin-edit (email and role disabled with a
  tooltip explaining why).
- Creating a user generates a temporary password and sets `mustChangePassword: true`; the
  password itself is never displayed — only a simulated "sent" toast, matching the existing
  `first-login-password-change` flow that already expects this field.
- Email uniqueness is validated in the service on create/edit against the live `mockUsers` array.
- SuperAdmin cannot deactivate their own account (self-row action disabled) and cannot deactivate
  other SuperAdmins from this UI (edit only) — both are UI-level guards, not new role-permission
  infrastructure.
- Deactivate/reactivate never touch `deletedAt`, matching the soft-delete convention established
  by `repositories-universal`.
- Add one new shadcn primitive, `src/components/ui/alert.tsx` (informational banner shown in the
  create-modal when role `admin` is selected, warning the new Admin has no group yet) — a new
  file, not a modification of an existing `ui/*` file, so ADR-001/ADR-013 don't apply.
- Connect the two existing placeholder routes (`/superadmin/users`, `/admin/group`) in
  `src/router/index.tsx` to the new pages.

## Capabilities

### New Capabilities

- `user-management`: SuperAdmin CRUD (create/edit/deactivate/reactivate, search, role/status
  filters) over all platform users, plus a scoped Admin view for editing basic data of the
  members already in their own group.

### Modified Capabilities

None. `shared-page-components` (`ConfirmModal`, `StatusBadge`, `useToast`) already has real
implementations from `mc-s05-feature-repositories-universal` and is only consumed here, not
changed.

## Impact

- **New code**: `src/features/user-management/**` (service, hook, schemas, components, pages).
- **New UI primitive**: `src/components/ui/alert.tsx` (shadcn Alert, no existing `ui/*` file
  modified).
- **Modified code**: `src/router/index.tsx` (wire 2 routes), `src/i18n/locales/es.json` +
  `en.json` (fill in the existing empty `"users": {}` key).
- **Data model**: none — `User`, `UserRole`, `Gender` in `src/types/index.ts` already have every
  field this change needs (`groupId`, `mustChangePassword`, `isActive`, etc.). `src/mock/seed/
  users.ts` already seeds the 6 users the visual test plan expects.
- **Depends on**: `mc-s04-feature-layout-shell` (Shell, PageWrapper, role-scoped routes already
  in place).
- **Blocks**: `mc-s07-feature-family-groups`, which expands `/admin/group` into full group
  management on top of the member table this change introduces.
