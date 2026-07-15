## Why

`mc-s06-feature-user-management` shipped `GroupMembersPage` at `/admin/group` as a
user-CRUD screen scoped to the Admin's own users, but it never touches `Group` or
`NonAccountMember` as first-class entities — there is no group name/header, no
non-account (pet/other) members in the table, no way to attach an *existing* account
by email, no member removal, and no onboarding. `Group` and `NonAccountMember` are
already fully modeled in `src/types/index.ts` and seeded in `src/mock/seed/`
(`mockGroups`, `mockNonAccountMembers`, `mockHealthProfiles`, and `previousGroupId`/
`shareHCWithPreviousGroup` already on `User`) but nothing reads or writes them through
a real service yet — `src/stores/group.store.ts`'s `setGroup` has zero callers.

This change builds the full MÓD-04 (Grupos familiares) feature: group creation,
onboarding, member management (with and without account) via `groups.service.ts`,
member removal, the implicit transfer when a member creates their own group, and the
health-record sharing flag — unblocking `08-feature-group-repositories` and
`09-feature-health-profile`, both of which depend on a real group/member data layer.

## What Changes

- Add `src/features/groups/` (services, hooks, schemas, components, pages) as the
  single owner of `Group`/`NonAccountMember` data, following the
  `Component → Hook → Service → Mock` pattern already used by `repositories-universal`
  and `user-management`.
- **BREAKING (internal)**: `GroupPage` (new) replaces `GroupMembersPage` at
  `/admin/group`. `features/user-management/pages/GroupMembersPage.tsx` and
  `components/GroupMembersList.tsx` are deleted — their user-listing responsibility
  is absorbed into the new `MemberTable`, which also lists `NonAccountMember` rows and
  supports removal. The "create a brand-new user account" capability they carried
  (email + temp password, reusing `usersService`) is preserved, folded into the new
  "Con cuenta" add-member flow instead of duplicated.
- Add group creation (`GRP-HU-01`): a user with no active group creates one, becomes
  its admin, gets an empty `HealthProfile`.
- Add a 3-step onboarding flow at `/admin/group/onboarding` (doctors → centers/
  pharmacies → members), each step skippable, re-enterable from the group page.
- Add `AddMemberPage`/modal at `/admin/group/members/new` with two tabs: attach an
  existing account by email (creating a new account inline if none is found) and add
  a member without an account (name/type/birth date/gender, gender required only for
  `type: 'human'`).
- Add member removal with a business-rule guard: the group admin cannot remove
  themselves (must transfer admin first — transfer itself is out of scope, see
  below); removing a `User` clears `groupId` (history preserved), removing a
  `NonAccountMember` soft-deletes it.
- Add the "member creates their own group" flow (`GRP-HU-06`): warns the member they
  will leave their current group, sets `previousGroupId`, promotes them to `admin`,
  creates the new group, then offers to toggle `shareHCWithPreviousGroup`.
- Add a `ShareHCToggle`, reversible, shown only when `previousGroupId !== null`. Since
  `/admin/settings` and `/member/settings` are still unbuilt route placeholders, this
  change creates minimal settings pages containing only this toggle and the
  "create your own group" CTA + warning modal — full account settings (password
  change, profile fields) stay out of scope for a future settings-specific change.
- Populate `src/stores/group.store.ts` (`setGroup`/`clearGroup`) from the new hooks
  so `useCurrentGroup()` finally reflects real data.
- Add all new strings under `groups.*` (and the settings CTA strings) to
  `i18n/locales/es.json` and `en.json`.

## Capabilities

### New Capabilities
- `family-groups`: group creation, onboarding, member management (with/without
  account), member removal, implicit admin transfer on new-group creation, and the
  health-record sharing flag with a previous group.

### Modified Capabilities
- `user-management`: the "Admin group-members access" requirement (`/admin/group`
  served by `GroupMembersPage`, scoped via `usersService.getVisibleForAdmin`) is
  removed. `/admin/group` is now served by `family-groups`'s `GroupPage`, scoped via
  `groupsService.getGroupMembers(groupId)`. `usersService` gains no new public
  surface for this change beyond what `family-groups` already composes
  (`usersService.create`/`getByEmail`-equivalent lookup) for the "attach existing
  account" flow.

## Impact

- New: `src/features/groups/{services,hooks,schemas,components,pages}/*`
- Removed: `src/features/user-management/pages/GroupMembersPage.tsx`,
  `src/features/user-management/components/GroupMembersList.tsx`
- Modified: `src/router/index.tsx` (new routes, `/admin/group` target swapped,
  `/admin/settings` and `/member/settings` placeholders replaced with minimal pages),
  `src/stores/group.store.ts` (wired up), `src/i18n/locales/{es,en}.json`
  (`groups.*` + settings CTA keys)
- No data-model changes: `Group`, `NonAccountMember`, and the `User` fields
  (`previousGroupId`, `shareHCWithPreviousGroup`) are already complete in
  `src/types/index.ts` and seeded — this change only adds the service/UI layer on
  top of them.
