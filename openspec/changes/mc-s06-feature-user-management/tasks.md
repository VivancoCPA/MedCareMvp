## 1. UI primitive

- [x] 1.1 Add `src/components/ui/alert.tsx` (shadcn `Alert`/`AlertTitle`/`AlertDescription`, wired to existing Tailwind alias tokens — new file, no existing `ui/*` file modified)

## 2. Schemas

- [x] 2.1 Create `src/features/user-management/schemas/user.schema.ts` with `createUserSchema`, `updateUserSuperAdminSchema`, `updateUserAdminSchema` and their inferred types (`CreateUserFormValues`, `UpdateUserSAFormValues`, `UpdateUserAdminFormValues`), reusing `validation.required` / `validation.email` / `validation.minLength` i18n keys

## 3. Service

- [x] 3.1 Create `src/features/user-management/services/users.service.ts`: `CreateUserDTO`, `UpdateUserDTO`, `UserError` class (`code: 'EMAIL_TAKEN'`)
- [x] 3.2 Implement `getAll()`, `getByGroup(groupId)`, `getById(id)` over `mockUsers`, each with simulated delay
- [x] 3.3 Implement `generateTempPassword()` (8+ chars, upper/lower/number/special) and use it in `create()`, setting `mustChangePassword: true`
- [x] 3.4 Implement email-uniqueness check (excluding the record's own id and any soft-deleted user) in `create()` and `update()`, throwing `UserError('EMAIL_TAKEN')`
- [x] 3.5 Implement `update(id, data)`, `deactivate(id)` (`isActive = false`, `updatedAt = now`, `deletedAt` untouched), `reactivate(id)` (`isActive = true`, `updatedAt = now`)
- [x] 3.6 Implement `getGroupName(groupId: string | null): string | null` reading `mockGroups` read-only (no delay, synchronous lookup)

## 4. Hook

- [x] 4.1 Create `src/features/user-management/hooks/useUsers.ts` — `useQuery` keyed by `['users']` or `['users', 'group', groupId]` depending on whether `groupId` is passed, plus `createMutation`/`updateMutation`/`deactivateMutation`/`reactivateMutation`, each invalidating the users query key and calling `useToast().toast(...)` on success/error
- [x] 4.2 On deactivate success, fire the two required toasts (deactivated + simulated PDF-sent); on create success, fire the two required toasts (created + simulated temp-password-sent)

## 5. Components

- [x] 5.1 Create `src/features/user-management/components/UserStatusBadge.tsx` — role badge (superadmin/admin/member colors per proposal §3.3)
- [x] 5.2 Create `src/features/user-management/components/UserFormModal.tsx` supporting `mode: 'create' | 'edit-superadmin' | 'edit-admin'`: shared fields (firstName, lastName, birthDate, gender, phone) always editable; email/role editable only in `create`/`edit-superadmin`, disabled with `Tooltip` in `edit-admin`; no `groupId` field in any mode; `Alert` warning shown when `role === 'admin'` in create mode
- [x] 5.3 Create `src/features/user-management/components/UserList.tsx` (SuperAdmin table): search input (debounced 300ms, matches name or email) + role `Select` + status `Select`, filtered with `useMemo`; columns Usuario (avatar+name+email), Rol (`UserStatusBadge`), Grupo (`usersService.getGroupName`, fallback `t('users.noGroup')`), Estado (`StatusBadge`), Creado (`formatDate`), Acciones (Editar always; Desactivar/Reactivar per §3.4 self/superadmin guard with `Tooltip` on the disabled self-row button); paginated via `usePagination` (page size 10); `Skeleton` while loading; `EmptyState` when filtered list is empty
- [x] 5.4 Create `src/features/user-management/components/GroupMembersList.tsx` (Admin table): columns Usuario, Teléfono, Fecha de nacimiento (`formatDate`), Estado, Acciones (Editar only); no search/filter/pagination needed at group scale

## 6. Pages

- [x] 6.1 Create `src/features/user-management/pages/UserListPage.tsx` — header + "Nuevo usuario" button, `UserList`, `UserFormModal` (create/edit-superadmin), two `ConfirmModal` instances (deactivate, reactivate) each with entity-specific message and `isLoading` state
- [x] 6.2 Create `src/features/user-management/pages/GroupMembersPage.tsx` — header showing `t('users.groupMembersTitle')` + `usersService.getGroupName(currentUser.groupId)`, `GroupMembersList` scoped to `useUsers(currentUser.groupId)`, `UserFormModal` in `edit-admin` mode only (no create, no confirm modals)

## 7. i18n

- [x] 7.1 Fill in the existing empty `"users": {}` key in `src/i18n/locales/es.json` per proposal §9 (title, buttons, modal titles, field labels, column labels, role/gender label maps, filters, confirm titles/messages, toasts, errors, tooltips, empty state, group members title)
- [x] 7.2 Mirror the same keys in `src/i18n/locales/en.json` with English copy

## 8. Routing integration

- [x] 8.1 In `src/router/index.tsx`, lazy-import `UserListPage` and `GroupMembersPage`
- [x] 8.2 Replace the `placeholder('Superadmin / Users')` element at `/superadmin/users` with `<UserListPage />`
- [x] 8.3 Replace the `placeholder('Admin / Group')` element at `/admin/group` with `<GroupMembersPage />`

## 9. Verification

- [x] 9.1 Run `npx tsc --noEmit` from `Med-care/` — 0 errors
- [x] 9.2 Manually run through the proposal's §11 visual test plan (login as superadmin, search/filter, create with duplicate email, create new member, edit, deactivate/reactivate with confirm + PDF toast, self-deactivate blocked, login as admin, edit group member, email/role disabled with tooltip)

## 10. Manual sync-01 — avatar, origin tracking & admin-initiated creation

- [x] 10.1 Add `avatarUrl: string | null` and `originAdminId: string | null` to the `User` type in `src/types/` (non-optional, matching the existing `Doctor.avatarUrl`/`originGroupId` convention rather than the delta's `?:`)
- [x] 10.2 Update the 6 existing records in `src/mock/seed/users.ts` with `avatarUrl: null, originAdminId: null`
- [x] 10.3 In `users.service.ts`, add `avatarUrl: string | null` to `CreateUserDTO`/`UpdateUserDTO` and `originAdminId: string | null` to `CreateUserDTO`
- [x] 10.4 In `users.service.ts`, replace `getByGroup(groupId)` with `getVisibleForAdmin(adminId)`: `mockUsers.filter(u => !u.deletedAt && (u.originAdminId === adminId || (u.originAdminId === null && u.groupId === null && u.role !== 'superadmin')))` — role exclusion added after live verification showed the seed SuperAdmin account (originAdminId/groupId both null) otherwise leaking into every Admin's unclaimed pool; confirmed with the user and synced into both spec copies
- [x] 10.5 In `users.service.ts`, `create()` persists `originAdminId` and `avatarUrl` exactly as given in the DTO
- [x] 10.6 In `useUsers.ts`, signature changed to `useUsers(options?: { adminId?: string })`, query key `['users', 'admin', adminId]`, calling `usersService.getVisibleForAdmin(adminId)`
- [x] 10.7 In `UserFormModal.tsx`, added avatar upload + circular preview (all three modes), wired to `avatarUrl`, `getInitials` fallback, "Quitar foto" control — mirrors `DoctorFormModal.tsx`'s existing pattern exactly
- [x] 10.8 In `UserList.tsx`, added Avatar column (image or initials fallback, 32×32px rounded-full)
- [x] 10.9 In `UserList.tsx`, added "Origen" column — reuses the existing `repositories.common.originPropagated`/`originSuperAdmin` i18n keys and `Badge` styling already established by `DoctorList.tsx`, instead of duplicating new `users.origin*` keys
- [x] 10.10 In `GroupMembersList.tsx`, added the same Avatar column as 10.8
- [x] 10.11 In `GroupMembersPage.tsx`, added a "Nuevo usuario" button opening `UserFormModal` in `create` mode, consuming `useUsers({ adminId: currentUser.id })`, injecting `originAdminId: currentUser.id` on the create call from the page, never the form
- [x] 10.12 In `UserListPage.tsx`, the SuperAdmin create call explicitly passes `originAdminId: null`
- [x] 10.13 Added `users.columns.origin`, `users.fieldAvatar`, `users.avatarAlt`, `users.removeAvatar` to `es.json`/`en.json` (reused existing `repositories.common.origin*` keys for badge text instead of duplicating `users.colOrigin`/`originSuperAdmin`/`originPropagated`; skipped unused `common.optional`)
- [x] 10.14 `npx tsc --noEmit` from `Med-care/` — 0 errors
- [x] 10.15 Verified live via a Playwright driver script against the running dev server (not just typecheck): logged in as both superadmin and admin.garcia, screenshotted `/superadmin/users` (Avatar + Origen columns, create modal with avatar upload) and `/admin/group` ("Nuevo usuario" button, Avatar column, create modal), confirmed zero console errors, and caught the SuperAdmin-leak bug fixed in 10.4
