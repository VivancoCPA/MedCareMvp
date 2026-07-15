## Context

`src/router/index.tsx` already declares `{ path: 'users', element: placeholder('Superadmin /
Users')() }` under `/superadmin` and `{ path: 'group', element: placeholder('Admin / Group')() }`
under `/admin`. `src/mock/seed/users.ts` already seeds 6 `User` records (1 superadmin, 2 admins —
one inactive, 2 members in a group, 1 member with no group) referenced by `SEED_IDS`, and
`src/types/index.ts` already has the full `User`/`UserRole`/`Gender` shape this feature needs —
no data-model changes are required, unlike `mc-s05`.

`mc-s05-feature-repositories-universal` already established the reference pattern this feature
copies almost exactly: one service per entity owning its mock array, one hook wrapping
query+mutations, `ConfirmModal`/`StatusBadge`/`useToast` as real shared primitives, `useMemo`
search/status filtering in the list component, and `usePagination` for the table. `UserList` is
the first list in the app to actually need pagination in practice (6+ seed rows, page size 10),
where the five `mc-s05` catalogs never exceeded one page.

One gap: nothing in the codebase currently owns `Group` data as a feature. `src/stores/
group.store.ts` (`useCurrentGroup`) exists but is never populated (`setGroup` has zero callers) —
`mc-s07-feature-family-groups` is what's expected to wire it up. This change still needs to
resolve a group's display name in two places: the "Grupo" column of the SuperAdmin table, and the
page header of `GroupMembersPage`. See Decision 3.

## Goals / Non-Goals

**Goals:**
- Reuse the `mc-s05` list+modal CRUD pattern exactly where it fits (service/hook shape,
  `ConfirmModal`, `StatusBadge`, `useToast`, `useMemo` filtering, skeleton/empty states).
- One `UserFormModal` parameterized by mode (`create-superadmin` / `edit-superadmin` /
  `edit-admin`) instead of three separate modal components — the field set overlaps enough
  (name, birthDate, gender, phone always editable) that duplicating the whole form would drift.
- Keep the Admin's view read-scoped by construction: `GroupMembersPage` only ever fetches users
  where `groupId === currentUser.groupId`, and its `UserFormModal` instance is always mounted in
  `edit-admin` mode, so email/role are structurally unreachable, not just visually disabled.
- Self-deactivation and superadmin-deactivation guards live in the SuperAdmin table component,
  computed from `useAuth().user`, not encoded as a new permission system.

**Non-Goals:**
- No group CRUD, member-without-account handling, or group repository management — that is
  `mc-s07-feature-family-groups` in full (D1 in the proposal).
- No real password delivery, hashing, or email sending — `passwordHash` stores the generated
  temp password in plaintext, matching every other seed row and `auth.service.ts`'s existing
  convention. "Toast de password temporal" / "Toast de PDF simulado" are UI-only stand-ins.
- No server-side pagination/search/sort — `usersService.getAll()` returns the full array; page
  size 10 is a client-side slice via the existing `usePagination` hook.
- `groupId` reassignment for any user — read-only everywhere in this change (D2 in the proposal).

## Decisions

### 1. `UserFormModal` takes an explicit `mode`, not a `role`-inferred one

```typescript
type UserFormMode = 'create' | 'edit-superadmin' | 'edit-admin'

interface UserFormModalProps {
  open: boolean
  mode: UserFormMode
  user?: User | null                 // present for both edit modes, absent for 'create'
  onClose: () => void
  onSubmit: (values: CreateUserFormValues | UpdateUserSAFormValues | UpdateUserAdminFormValues) => Promise<void>
}
```

`UserListPage` (SuperAdmin) only ever passes `'create'` or `'edit-superadmin'`.
`GroupMembersPage` (Admin) only ever passes `'edit-admin'`. The mode is a caller-supplied prop,
not derived from `useAuth().role` inside the modal — this keeps the modal a dumb, testable
presentation component and keeps the actual authorization decision (which page can open which
mode) at the routing/page level, matching how `RoleGuard` already gates the two routes.

Rejected alternative: three separate modal components (`CreateUserModal`,
`EditUserSuperAdminModal`, `EditUserAdminModal`). Rejected because the shared fields (firstName,
lastName, birthDate, gender, phone) and shared layout would be duplicated three times for a
difference that's really just "which fields are visible/enabled," which a single `mode` switch
expresses more directly.

### 2. Three Zod schemas, one shared field-level message convention

`createUserSchema`, `updateUserSuperAdminSchema`, `updateUserAdminSchema` as specified in the
proposal (§8), reusing the project's existing `validation.required` / `validation.email` /
`validation.minLength` i18n keys — same convention `doctor.schema.ts` already uses — rather than
introducing a parallel `users.validation.*` namespace.

### 3. Group-name resolution: `users.service.ts` reads `mockGroups` read-only, in addition to `mockUsers`

The proposal's R1 ("only `users.service.ts` imports from `src/mock`") is honored, but widened
in one narrow way: `users.service.ts` also imports `mockGroups` from `@/mock` — read-only, never
mutated — and exports a synchronous helper:

```typescript
function getGroupName(groupId: string | null): string | null {
  if (!groupId) return null
  return mockGroups.find((g) => g.id === groupId)?.name ?? null
}
```

Used directly by `UserList` (SuperAdmin "Grupo" column, falling back to `t('users.noGroup')`)
and by `GroupMembersPage` (header: `t('users.groupMembersTitle')` + group name). This is
necessary because no `groups` feature/service exists yet — `useCurrentGroup()` is unpopulated
(see Context) and `mc-s07` is what's expected to introduce a real groups service. `getGroupName`
is intentionally synchronous (no simulated delay, no query key) since it's a pure lookup, not a
mutable resource this feature owns — the same category as `formatDate()`/`getInitials()` in
`src/lib/utils.ts`, just entity-specific enough to live next to the one service that already
touches user/group relationships.

Rejected alternative: build a minimal `groups.service.ts` inside this feature just for name
lookups. Rejected — it would create a second, throwaway "groups" service that `mc-s07` then has
to reconcile with or replace, for a feature that never needs to create/update/list groups.

`GroupMembersPage` gets its own scope from `useAuth().user.groupId` directly (always available on
the logged-in Admin's `User` record) rather than from `useCurrentGroup()` — avoids a hard
dependency on a store this change doesn't populate.

### 4. Reactivate uses `ConfirmModal` here, unlike `repositories-universal`

`mc-s05`'s spec explicitly reactivates without confirmation ("Reactivate does not require
confirmation"). This proposal's §3.6 explicitly asks for a confirmation step on reactivate too.
This is a deliberate per-feature choice (reactivating a user's platform access is a more
consequential action than reactivating a catalog record) — both `UserListPage`'s deactivate and
reactivate flows reuse the existing generic `ConfirmModal`, just with two separate pieces of
state (`confirmDeactivateTarget`, `confirmReactivateTarget`), the same two-state shape
`DoctorListPage` already uses for its (single) confirm flow.

### 5. Self/superadmin deactivation guards are computed in `UserList`, not the service

```typescript
const canDeactivate = (row: User) =>
  row.role !== 'superadmin' && row.id !== currentUser.id
```

The "Desactivar" action renders as a disabled `Button` wrapped in `Tooltip`/`TooltipTrigger`/
`TooltipContent` (existing primitive, already used in `SidebarNavItem`) when `!canDeactivate`,
showing `t('users.cannotDeactivateSelf')` only for the self-row case (rows for other superadmins
simply omit the deactivate action entirely — editing is still available, matching §3.4: "no
muestran botón Desactivar"). `usersService.deactivate()` itself has no special-cased guard; it is
a UI-only restriction, consistent with this feature not introducing a new permission-check layer
server-side (there is no server).

### 6. Temp password generation and email-uniqueness live in `users.service.ts`, not the schema

`generateTempPassword()` (proposal §4.4) and the email-uniqueness check (proposal §4.5) run
inside `create`/`update`, not as an async Zod `.refine()`. Zod validation stays synchronous and
purely shape-based (matches every other schema in the codebase); uniqueness is a data-layer
concern checked against the live `mockUsers` array at mutation time and surfaced through a
`UserError` class (mirroring `AuthError` in `auth.service.ts`: a `code` field plus a
`useUsers`/form-level catch that maps `EMAIL_TAKEN` to `t('users.errorEmailTaken')` shown as a
form error on the email field, not a toast — keeps the modal open with the user's other input
intact, same as `mc-s05`'s "Mutation failure keeps modal open" behavior).

### 7. New `ui/alert.tsx` primitive, not a bespoke banner

The "Admin sin grupo" warning (proposal §4.6) is the first `Alert` usage in the codebase. Added as
`src/components/ui/alert.tsx`, the standard shadcn Alert (`Alert`, `AlertTitle`, `AlertDescription`),
copied/wired the same way `textarea.tsx` and `skeleton.tsx` were added in `mc-s05` — a new file
under `ui/`, not a modification of an existing one, so ADR-001/ADR-013 don't apply.

### 8. Pages don't self-wrap in `PageWrapper`

`PageWrapper` already wraps every routed page's `<Outlet />` at the `Shell` layout level
(`src/components/layout/Shell.tsx`). `UserListPage` and `GroupMembersPage` render their content
directly (header + list + modals), the same way `DoctorListPage` does — not nested in a second
`PageWrapper`, despite the proposal's layout diagram showing it as an explicit wrapper.

## Risks / Trade-offs

- **[Risk]** Widening `users.service.ts` to also read `mockGroups` blurs the "one service, one
  mock array" convention `mc-s05` established.
  → **Mitigation**: strictly read-only, one pure lookup function, documented here and in
  `specs/user-management/spec.md`; `mc-s07`'s eventual `groups.service.ts` can own writes without
  conflicting, since this function never mutates `mockGroups`.
- **[Risk]** A single `UserFormModal` with three modes is more branching than three focused
  components, raising the chance a future edit (e.g. a new field) is wired into the wrong mode's
  visibility rules.
  → **Mitigation**: `specs/user-management/spec.md` states field-visibility-per-mode as its own
  testable requirement with explicit scenarios for all three modes, so drift is a spec violation,
  not a silent gap.
- **[Risk]** Deactivation guards (self, other-superadmins) are UI-only, not enforced by
  `usersService.deactivate()`.
  → **Mitigation**: acceptable for this MVP mock layer (no server to bypass the UI against);
  called out explicitly so a future real-backend change knows to add the same checks
  server-side.

## Open Questions

None blocking. `getGroupName`'s placement inside `users.service.ts` (Decision 3) is the one item
worth revisiting once `mc-s07-feature-family-groups` introduces a real groups service — flagged
there as a likely refactor (move the lookup into the new service), not resolved here.
