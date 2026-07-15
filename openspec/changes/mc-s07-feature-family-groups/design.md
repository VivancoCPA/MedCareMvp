## Context

`src/types/index.ts` already has the complete `Group`, `NonAccountMember`, and
group-related `User` fields (`groupId`, `previousGroupId`, `shareHCWithPreviousGroup`,
`originAdminId`) — no type changes are needed, unlike the source document driving
this change assumed. Note the real `NonAccountMember` shape differs from a plainer
`name`/`type`/`gender` sketch: it's `firstName` + `lastName: string | null`,
`memberType: 'human' | 'pet' | 'other'` (not `type`), `gender: Gender` (non-nullable,
`'unspecified'` is a valid value — not `Gender | null`), plus `breed: string | null`
and `bloodType: BloodType | null`, both already present in seed data
(`mock/seed/non-account-members.ts`) and mirrored onto the linked `HealthProfile`.

`mock/seed/groups.ts`, `non-account-members.ts`, and `health-profiles.ts` all already
seed realistic data (2 groups, 2 non-account members, 5 health profiles). `src/mock/
index.ts` already re-exports all three. `src/stores/group.store.ts` (`useGroupStore`/
`useCurrentGroup`) exists with `setGroup`/`clearGroup` but zero callers.

The bigger gap from what the source document assumed: `GroupMembersPage` is **not**
a minimal placeholder. `mc-s06-feature-user-management` built it out fully — it lists
`User`-only group members via `usersService.getVisibleForAdmin(adminId)` (an
origin-based heuristic: users with `originAdminId === adminId`, plus an "unclaimed
pool" of superadmin-created users with no `originAdminId`/`groupId`), and lets the
Admin create brand-new user accounts (email + temp password) or edit existing ones
via `UserFormModal`. Critically, users created this way **never get a real
`groupId`** — group membership was simulated entirely through `originAdminId`
because no real `Group` data layer existed yet. This change is what makes group
membership real, so it must also close that gap.

`features/groups/` and `features/repositories-group/` already exist as empty
scaffolded directories — confirming this feature (and `08`) were planned to live
there, separate from `user-management`.

## Goals / Non-Goals

**Goals:**
- Make `groupId` the real, authoritative membership link for every group member
  (`User` or `NonAccountMember`) going forward — no more origin-based heuristics for
  group scoping.
- One `groups.service.ts` owning `Group`/`NonAccountMember` mock arrays and the
  group-membership fields on `User` (`groupId`, `previousGroupId`,
  `shareHCWithPreviousGroup`, `role` promotion to `admin`), composing `usersService`
  for anything that's genuinely user-profile concern (creating a brand-new account,
  temp password generation) instead of duplicating it.
- Absorb `GroupMembersPage`'s two still-needed capabilities — creating a brand-new
  account for a member, and editing a member's profile — into the new `GroupPage`,
  rather than losing them.
- Keep onboarding's doctor/center/pharmacy steps as pure layout + skip, per the
  proposal — `08-feature-group-repositories` owns the real selectors.

**Non-Goals:**
- No admin-to-admin transfer UI. The only way a `User` stops being their group's
  admin is by creating their own new group (`GRP-HU-06`), which reassigns them to a
  *different* group as its admin. There is no flow to hand off admin rights to
  another member of the *same* group while staying in it — see Open Questions.
- No repository (doctor/center/pharmacy) propagation logic — `08`.
- No real `HealthProfile` content beyond empty-record creation — `09`.
- No changes to `Group`/`NonAccountMember`/`User` types — already complete.

## Decisions

### 1. `GroupPage` replaces `GroupMembersPage`; `usersService.getVisibleForAdmin` is deleted

`/admin/group` now renders `features/groups/pages/GroupPage.tsx`. `features/
user-management/pages/GroupMembersPage.tsx` and `components/GroupMembersList.tsx`
are deleted outright — `MemberTable` (new) supersedes `GroupMembersList` and also
renders `NonAccountMember` rows, which `GroupMembersList` never could.
`usersService.getVisibleForAdmin` and the `useUsers({ adminId })` overload become
dead code once `GroupMembersPage` is gone (no other caller) and are deleted with it.
`UserListPage`/`useUsers()` (no args) are untouched.

Rejected alternative: keep `GroupMembersPage` alongside a new `GroupPage` at a
different route. Rejected — it would leave two competing, half-real ways to list a
group's members, and the proposal is explicit that `GroupPage` **is** what
`/admin/group` renders.

### 2. "Con cuenta" tab unifies attach-existing-by-email with create-brand-new-account

`AddMemberTabs` → "Con cuenta" searches `mockUsers` by email via
`groupsService.addAccountMember({ groupId, email })`. Two outcomes:
- Found, no group (`groupId === null`): attach — set `groupId`, create empty
  `HealthProfile`.
- Found, already in a group: error, exact copy from proposal §9.3.
- Not found: instead of a dead end, `AddAccountMemberForm` offers "crear una cuenta
  nueva para esta persona", reusing the same fields `UserFormModal`'s `create` mode
  already collects (firstName, lastName, birthDate, gender, phone, avatarUrl). This
  calls `groupsService.createAccountMember({ groupId, adminId, ...profileFields })`,
  which internally calls `usersService.create({ ...profileFields, role: 'member',
  originAdminId: adminId, groupId })` — `CreateUserDTO` gains an optional `groupId`
  field it did not have before (previously `GroupMembersPage`'s create call never
  set one, relying on the origin heuristic; this change fixes that at the source).
  `usersService.create` keeps owning temp-password generation and email-uniqueness —
  `groups.service.ts` never duplicates that logic.

Rejected alternative: a third "create new account" tab. Rejected — from the Admin's
perspective both outcomes answer the same question ("does this person have their own
login?"); splitting them into separate tabs would force the Admin to know in advance
whether the email exists.

### 3. `groups.service.ts` writes `mockUsers`' membership fields directly; `mockHealthProfiles` gets its first writer

Mirroring the narrow, documented mock-sharing precedent `mc-s06` set (Decision 3
there: `users.service.ts` reads `mockGroups` read-only), `groups.service.ts` imports
`mockUsers` directly and mutates only `groupId`, `previousGroupId`,
`shareHCWithPreviousGroup`, and `role` (promotion to `'admin'` on group creation) —
never profile fields, which stay `usersService`'s job. `groups.service.ts` also
becomes `mockHealthProfiles`' first writer (no service owns it yet since
`09-feature-health-profile` hasn't been proposed): every new member (with or without
an account) gets an empty `HealthProfile` row created alongside them, and the group's
first admin gets one on `createGroup`.

### 4. `useGroupMembers` syncs `group.store.ts`; `useGroup` stays a lighter standalone query

`useGroupMembers(groupId)`'s `queryFn` fetches the group and its members together,
calls `useGroupStore.getState().setGroup(group, members)` as a plain imperative
write (not inside a `useEffect` — R1 forbids deriving state via `useEffect`, not
synchronous store writes during data fetching), then returns `{ group, members }`.
This is the one place the store gets populated/refreshed. `useGroup(groupId)` stays
a separate, simpler query (group header only) for any future caller (e.g. a
breadcrumb) that shouldn't have to pull the full member list just to show a group
name — it does not touch the store.

Mutations (`useCreateGroup`, `useAddAccountMember`, `useAddNonAccountMember`,
`useRemoveMember`) invalidate `['groupMembers', groupId]`, which re-runs the query
above and re-syncs the store — no separate manual `setGroup` call needed in mutation
`onSuccess` handlers.

### 5. Admin self-removal is a hard `groups.service.ts` guard, not just a disabled button

`removeMember` throws a `GroupError('CANNOT_REMOVE_SELF_AS_ADMIN')` when
`memberType === 'user' && memberId === group.adminId`, mirroring `UserError` from
`mc-s06`. The UI additionally disables the action with a tooltip (defense in depth,
same convention as `UserList`'s self/superadmin deactivation guard), but the
service-level throw is the actual invariant enforcement, since this one is a data
integrity rule (a group must always have exactly one admin), not just a UX nicety.

### 6. `AddMemberPage` route renders a modal over `GroupPage`, matching the `mc-s05` decision

`/admin/group/members/new` is declared as a route (deep-linkable), but its element
renders `GroupPage` with the modal defaulted open, then navigates back to
`/admin/group` on close — same "route-addressable modal" pattern already used for
list+modal CRUD elsewhere in the app. `GroupOnboardingPage` is a real full-page
route (it's a multi-step flow, not a form-in-a-modal), matching how `05`'s technical
spec already separates the two.

### 7. Non-account member gender: always required, defaults to `'unspecified'` for non-human

Since `NonAccountMember.gender` is `Gender` (non-nullable, `'unspecified'` included),
`nonAccountMemberSchema` requires `gender` unconditionally (no `superRefine`/nullable
needed, unlike the source document's sketch, which assumed a nullable field).
`AddNonAccountMemberForm` defaults the `Select` to `'unspecified'` and only surfaces
male/female/other as meaningful choices when `memberType === 'human'`; `breed` shows
only for `memberType === 'pet'`; `bloodType` is always an optional `Select` across
all types (matches existing seed data, where `Max` the dog has `bloodType: null` and
`Sofía` the child has `bloodType: 'A+'`). The created `HealthProfile.bloodType` is
seeded from the same value the form collected, matching current seed convention.

## Risks / Trade-offs

- **[Risk]** Deleting `GroupMembersPage`/`getVisibleForAdmin` outright is a bigger
  footprint change than a typical additive feature — any other in-flight work
  branching off `mc-s06` would conflict.
  → **Mitigation**: `mc-s06` is already merged to `main` per repo history; this is a
  clean sequential change, not a concurrent one.
- **[Risk]** `groups.service.ts` writing `mockUsers` fields directly (Decision 3)
  re-opens the "which service owns this array" question `mc-s06` narrowly closed.
  → **Mitigation**: scoped to exactly 4 named fields, documented here and in
  `specs/family-groups/spec.md`; `usersService` still exclusively owns every other
  `User` field and all of `create`/`update`/`deactivate`/`reactivate`.
- **[Risk]** No admin-transfer flow means a single-admin group has no recovery path
  if that admin becomes unavailable (loses account access, etc.) other than a
  superadmin-level intervention outside this app's UI.
  → **Mitigation**: explicitly out of scope (Non-Goals); flagged as an Open Question
  for a future change.
- **[Risk]** Minimal settings pages (just the CTA + toggle) risk being mistaken for
  "settings is done" and skipped when a real settings change is scoped later.
  → **Mitigation**: proposal and tasks both state explicitly that only the
  group-related widgets are in scope here.

## Open Questions

- Should a future change add member-to-member admin transfer within the same group?
  Not blocking here — `removeMember`'s error copy ("transfer admin first") is kept
  verbatim from the source proposal even though no transfer UI exists yet; the only
  real exit path today is `GRP-HU-06` (create your own group elsewhere).
