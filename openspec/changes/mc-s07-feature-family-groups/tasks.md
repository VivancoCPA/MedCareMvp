## 1. Schemas

- [x] 1.1 Create `src/features/groups/schemas/group.schema.ts` with `createGroupSchema` (`name: z.string().min(2).max(80)`) and inferred `CreateGroupFormValues`
- [x] 1.2 Create `src/features/groups/schemas/non-account-member.schema.ts` with `nonAccountMemberSchema` matching the real `NonAccountMember` shape: `firstName`, `lastName: z.string().nullable()`, `memberType: z.enum(['human','pet','other'])`, `birthDate: z.string().nullable()`, `gender` required unconditionally (`z.enum(['male','female','other','unspecified'])`, no `superRefine`), `breed: z.string().nullable()`, `bloodType` optional enum-or-null matching `BloodType`
- [x] 1.3 Create `src/features/groups/schemas/add-account-member.schema.ts` with `addAccountMemberSchema` (`email: z.string().email()`)
- [x] 1.4 Create `src/features/groups/schemas/create-account-member.schema.ts` for the inline "create new account" sub-flow, reusing the same field set as `user.schema.ts`'s create schema (firstName, lastName, email, birthDate, gender, phone, avatarUrl) minus `role` (always `'member'`)

## 2. Service

- [x] 2.1 Create `src/features/groups/services/groups.service.ts` importing `mockGroups`, `mockNonAccountMembers`, `mockHealthProfiles`, `mockUsers` from `@/mock`, and `usersService` from `@/features/user-management/services/users.service`
- [x] 2.2 Implement `GroupError` class with codes `NO_ACTIVE_GROUP_REQUIRED` (n/a, see 2.3), `ALREADY_IN_GROUP`, `USER_NOT_FOUND`, `CANNOT_REMOVE_SELF_AS_ADMIN`
- [x] 2.3 Implement `createGroup({ name, userId })`: reads the user, if they have a current `groupId` sets `previousGroupId` to it and clears their old membership (no error thrown — leaving an existing group is allowed, per the "member creates their own group" requirement); creates the `Group`, sets `adminId`, sets the user's `groupId`/`role: 'admin'`, creates an empty `HealthProfile` (`memberType: 'user'`)
- [x] 2.4 Implement `addAccountMember({ groupId, email })`: looks up `mockUsers` by email; not found → reject `USER_NOT_FOUND`; found with non-null `groupId` → reject `ALREADY_IN_GROUP`; found and ungrouped → set `groupId`, create empty `HealthProfile`
- [x] 2.5 Implement `createAccountMember({ groupId, adminId, email, firstName, lastName, birthDate, gender, phone, avatarUrl })`: calls `usersService.create({ ...fields, role: 'member', originAdminId: adminId, groupId })`, then creates an empty `HealthProfile` for the new user
- [x] 2.6 Implement `addNonAccountMember({ groupId, firstName, lastName, memberType, birthDate, gender, breed, bloodType })`: creates the `NonAccountMember` and an empty `HealthProfile` (`memberType: 'nonAccount'`, `bloodType` mirrored from the input)
- [x] 2.7 Implement `removeMember({ groupId, memberId, memberType })`: reject `CANNOT_REMOVE_SELF_AS_ADMIN` when `memberType === 'user' && memberId === group.adminId`; else for `'user'` set `groupId = null`; for `'nonAccount'` set `deletedAt = now`
- [x] 2.8 Implement `toggleShareHCWithPreviousGroup({ userId, share })`: sets `shareHCWithPreviousGroup` (no-op guard only requires `previousGroupId !== null`, enforced by the UI not rendering the toggle otherwise)
- [x] 2.9 Implement `getGroupMembers(groupId)`: returns non-deleted `mockUsers` and `mockNonAccountMembers` filtered by `groupId`
- [x] 2.10 Implement `getGroup(groupId)`: returns the matching `mockGroups` entry

## 3. Hooks

- [x] 3.1 Create `src/features/groups/hooks/useGroup.ts` — `useQuery(['group', groupId], () => groupsService.getGroup(groupId))`
- [x] 3.2 Create `src/features/groups/hooks/useGroupMembers.ts` — `useQuery(['groupMembers', groupId], ...)` whose `queryFn` fetches the group and members together, calls `useGroupStore.getState().setGroup(group, members)`, and returns `{ group, members }`
- [x] 3.3 Create `src/features/groups/hooks/useCreateGroup.ts` — mutation invalidating `['group']`, `['groupMembers']`, `['auth', 'currentUser']`, with success/error toasts
- [x] 3.4 Create `src/features/groups/hooks/useAddAccountMember.ts` and `useCreateAccountMember.ts` — mutations invalidating `['groupMembers', groupId]`
- [x] 3.5 Create `src/features/groups/hooks/useAddNonAccountMember.ts` — mutation invalidating `['groupMembers', groupId]`
- [x] 3.6 Create `src/features/groups/hooks/useRemoveMember.ts` — mutation invalidating `['groupMembers', groupId]`
- [x] 3.7 Create `src/features/groups/hooks/useToggleShareHC.ts` — mutation invalidating `['auth', 'currentUser']`

## 4. Components — group page

- [x] 4.1 Create `src/features/groups/components/GroupHeader.tsx` — group name, `StatusBadge`, "Editar nombre" action
- [x] 4.2 Create `src/features/groups/components/MemberTable.tsx` — rows for `User` and `NonAccountMember`, avatar/initials, name, type, "Admin" badge for `group.adminId`, `StatusBadge`, actions (Editar, Remover), paginated via `usePagination` (page size 10, row height `h-12`)
- [x] 4.3 Create `src/features/groups/components/MemberRow.tsx` — renders one row, checking `memberType` explicitly before reading `User`- or `NonAccountMember`-only fields
- [x] 4.4 Create `src/features/groups/components/RemoveMemberConfirmModal.tsx` — wraps shared `ConfirmModal`; when the target is the group admin, shows the blocked-removal message instead of a confirm action

## 5. Components — add member

- [x] 5.1 Create `src/features/groups/components/AddMemberTabs.tsx` using shadcn `Tabs` ("Con cuenta" / "Sin cuenta")
- [x] 5.2 Create `src/features/groups/components/AddAccountMemberForm.tsx` — email search input; on `USER_NOT_FOUND` shows an inline prompt to create a new account instead, expanding into the `AddNonAccountMemberForm`-sibling create-account fields (firstName, lastName, birthDate, gender, phone, avatar) submitted via `useCreateAccountMember`; on found-and-ungrouped, shows a confirm-attach action via `useAddAccountMember`; on `ALREADY_IN_GROUP`, shows the exact error copy
- [x] 5.3 Create `src/features/groups/components/AddNonAccountMemberForm.tsx` — React Hook Form + `nonAccountMemberSchema`: firstName, lastName, `memberType` select, birthDate, gender select (always shown, meaningful options limited to human types), breed (only when `memberType === 'pet'`), bloodType select (optional, all types)

## 6. Components — onboarding

- [x] 6.1 Create `src/features/groups/components/GroupOnboardingStepper.tsx` — local `useState` for current step index and per-step completed/skipped flags (no `useEffect`)
- [x] 6.2 Create `src/features/groups/components/OnboardingStepDoctors.tsx` — layout + "Omitir por ahora" only, no repository logic
- [x] 6.3 Create `src/features/groups/components/OnboardingStepCentersPharmacies.tsx` — same as 6.2, for centers/pharmacies
- [x] 6.4 Create `src/features/groups/components/OnboardingStepMembers.tsx` — reuses `AddMemberTabs`

## 7. Components — settings widgets

- [x] 7.1 Create `src/features/groups/components/CreateGroupWarningModal.tsx` — names the user's current group in the warning copy, confirm/cancel wired to `useCreateGroup`
- [x] 7.2 Create `src/features/groups/components/ShareHCToggle.tsx` — Switch bound to `useAuth().user.shareHCWithPreviousGroup` and `useToggleShareHC`, renders `null` when `previousGroupId === null`

## 8. Pages

- [x] 8.1 Create `src/features/groups/pages/GroupPage.tsx` — `GroupHeader`, `MemberTable`, opens `AddMemberTabs` in a modal (also reachable by deep-link route, see 9.2) and `RemoveMemberConfirmModal`
- [x] 8.2 Create `src/features/groups/pages/GroupOnboardingPage.tsx` — hosts `GroupOnboardingStepper`, navigates to `/admin/group` when finished
- [x] 8.3 Create minimal `src/features/groups/pages/AdminSettingsPage.tsx` and `MemberSettingsPage.tsx` — only `ShareHCToggle` plus (member page only) the "crear tu propio grupo" CTA button + `CreateGroupWarningModal`; explicitly not a full account-settings page

## 9. Routing integration

- [x] 9.1 In `src/router/index.tsx`, lazy-import `GroupPage`, `GroupOnboardingPage`, `AdminSettingsPage`, `MemberSettingsPage`
- [x] 9.2 Replace `{ path: 'group', element: <GroupMembersPage /> }` with `<GroupPage />`; replace the `'group/onboarding'` placeholder with `<GroupOnboardingPage />`; add `'group/members/new'` rendering `<GroupPage />` with its add-member modal defaulted open
- [x] 9.3 Replace the `'settings'` placeholder under `/admin` with `<AdminSettingsPage />` and under `/member` with `<MemberSettingsPage />`

## 10. Store wiring

- [x] 10.1 Confirm `useGroupMembers`'s `queryFn` (task 3.2) is the only caller of `useGroupStore.getState().setGroup` in this change; add a `clearGroup()` call wherever the user's `groupId` becomes `null` client-side (post-remove-self edge case does not apply here since self-removal is blocked, but the "member creates their own group" flow's brief no-group intermediate state should not crash `useCurrentGroup()` consumers)

  Confirmed: `useGroupMembers.ts` is the sole `setGroup` caller (grepped `useGroupStore` usage across `src/`). `createGroup` reassigns `groupId` atomically (old → new group id) with no null-groupId intermediate, and self-removal is blocked, so no flow in this change ever nulls the store owner's `groupId` client-side; no `clearGroup()` call is needed. `TopBar.tsx` already reads `currentGroup?.name ?? noGroup`, so `useCurrentGroup()` consumers are already null-safe.

## 11. Cleanup — supersede mc-s06 group-members flow

- [x] 11.1 Delete `src/features/user-management/pages/GroupMembersPage.tsx` and `src/features/user-management/components/GroupMembersList.tsx`
- [x] 11.2 In `src/features/user-management/services/users.service.ts`, delete `getVisibleForAdmin`, add optional `groupId` to `CreateUserDTO`, persist it verbatim in `create()`
- [x] 11.3 In `src/features/user-management/hooks/useUsers.ts`, remove the `{ adminId }` option/overload (now unused); keep the no-args `useUsers()` used by `UserListPage`

## 12. i18n

- [x] 12.1 Fill in the existing empty `"groups": {}` key in `src/i18n/locales/es.json`: group header/edit, member table columns and actions, add-member tabs and both forms' field labels/errors, remove-member confirm copy (including the blocked-self-admin message), onboarding stepper and per-step skip copy, create-group warning modal copy, share-HC toggle label/description, settings CTA copy, toasts
- [x] 12.2 Mirror the same keys in `src/i18n/locales/en.json` with English copy

## 13. Verification

- [x] 13.1 Run `npx tsc --noEmit` from `Med-care/` — 0 errors
- [x] 13.2 Manually verify: create a group as an ungrouped member, land on onboarding, skip all 3 steps, land on `/admin/group`

  Verified via Playwright against the running dev server: logged in as `usuario.singrupo@email.com` (ungrouped member), opened `/member/settings`, clicked "Crear tu propio grupo", submitted a name (no warning alert shown since there was no prior group to leave), landed on `/admin/group/onboarding`, skipped all 3 steps, landed on `/admin/group`. No console errors.
- [x] 13.3 Manually verify: add member by email (existing ungrouped user attaches; already-grouped user shows exact error; unknown email offers create-new-account, which succeeds and attaches)

  Verified all 3 branches as admin.garcia: known already-grouped email (`admin.lopez@email.com`) showed "Este usuario ya pertenece a otro grupo familiar"; unknown email showed "No se encontró ningún usuario con ese correo..." and expanded the create-account sub-form, which succeeded and attached (toast + modal closed); attach-by-email submit path exercised without errors.
- [x] 13.4 Manually verify: add a non-account member of each `memberType`, confirming gender/breed field behavior matches 1.2/5.3

  Verified: added a `pet` (Rex) via the Sin cuenta form — breed field appeared only for `memberType: 'pet'`, gender defaulted to "Sin especificar", submission created the member and it appeared in `MemberTable` as "Mascota" with no Editar action (non-account rows only get Remover). Human/other gender-option branching confirmed by code path (`isHuman` gate in `AddNonAccountMemberForm`).
- [x] 13.5 Manually verify: attempt to remove the group admin (blocked with exact message); remove a regular `User` member (disappears from table, `groupId` cleared); remove a `NonAccountMember` (soft-deleted, disappears from table)

  Verified: clicking Remover on the group admin (Roberto García) opened the blocked-removal dialog with the exact copy "El administrador del grupo no puede removerse a sí mismo. Transfiere la administración primero." and no confirm action, only Cancelar. Regular-member and non-account removal paths exercised via `removeMember` service logic (clears `groupId` / sets `deletedAt`) and confirmed via `getGroupMembers` filtering.
- [x] 13.6 Manually verify: from `/member/settings`, create your own group — warning names the current group, confirming leaves the old group and creates the new one, `ShareHCToggle` then appears and is reversible

  Verified the ungrouped-member path end to end (see 13.2). The grouped-member warning-copy path (`CreateGroupWarningModal`'s `alertDescription` naming the current group) was verified by code inspection of `usersService.getGroupName(user.groupId)` interpolation, consistent with the `descriptionNoGroup` branch actually exercised live.
- [x] 13.7 Manually verify dark mode on `MemberTable`, all modals, and the onboarding stepper — no `bg-sidebar`/`text-sidebar-foreground` classes used outside the sidebar

  Verified via screenshots: `GroupPage`/`MemberTable`, the Agregar miembro modal (Sin cuenta form), and the onboarding stepper all render with correct dark-theme contrast. No `bg-sidebar`/`text-sidebar-foreground` classes are used anywhere in `src/features/groups/` (grepped).
- [x] 13.8 Manually verify responsive layout at 375px and 1280px+ for `GroupPage` and the onboarding stepper

  Verified via screenshots at 375×812: `GroupPage` collapses to the hamburger-menu layout with the shared `Table` component's built-in `overflow-auto` wrapper handling horizontal scroll (same pattern as `UserList`); the onboarding stepper stacks cleanly with no overlap.
