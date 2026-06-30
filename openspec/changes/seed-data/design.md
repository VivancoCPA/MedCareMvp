## Context

The project has two conflicting sources of truth for TypeScript interfaces:
- `openspec/specs/data-model.md` — the authoritative spec (matches the user's requirements exactly)
- `Med-care/src/types/index.ts` — the file actually consumed by code (currently outdated)

The divergences are significant: `src/types/index.ts` is missing `mustChangePassword`, `groupId`, `birthDate`, `gender` on `User`; uses `'account' | 'non-account'` for `MemberType` instead of `'user' | 'nonAccount'`; uses `NonAccountMemberType` of `'minor' | 'dependent'` instead of `'human' | 'pet' | 'other'`; lacks `originGroupId` on `Doctor`/`MedicalCenter`; uses `dosage` instead of `dose`; and more. Attempting `npx tsc --noEmit` against the spec-aligned seed data will fail until the types file is synchronized.

Additionally, `src/mock/seed/group-repositories.ts` exports a single `mockGroupRepositories: unknown[]` placeholder, while the data model defines four separate junction types (`GroupDoctor`, `GroupMedicalCenter`, `GroupInsurer`, `GroupPharmacy`) that need four separate typed arrays.

`src/mock/index.ts` already has the correct named export shape but references the outdated single `mockGroupRepositories` export that must be replaced.

## Goals / Non-Goals

**Goals:**
- Synchronize `src/types/index.ts` with `openspec/specs/data-model.md` as a prerequisite step
- Create `src/mock/seed/ids.ts` as the single registry of all hardcoded UUIDs
- Populate all 14 seed files with realistic, relationally-consistent data
- Implement all 3 mock helpers with their full logic
- Replace `mockGroupRepositories` single-array export with 4 separate typed arrays
- Update `src/mock/index.ts` to re-export everything by explicit name
- Achieve `npx tsc --noEmit` passing with zero errors

**Non-Goals:**
- Modifying `openspec/specs/data-model.md` (it is the source of truth)
- Adding features or entities beyond what the spec defines
- Implementing real authentication (seed stores plaintext passwords in `passwordHash` for mock comparison)
- Persistent storage (all data lives in module-scope `let` arrays, reset on page reload)

## Decisions

### Decision 1 — Sync types first, then seed
**Chosen**: Update `src/types/index.ts` to exactly match `openspec/specs/data-model.md` before writing a single seed object.
**Why**: Any seed file written against the current stale types would require a rewrite. Doing types first makes the subsequent 14 seed files a single-pass implementation.
**Alternative considered**: Write seed data targeting the stale types, then update types. Rejected — double rewrite of all seed objects.

### Decision 2 — ids.ts as the only source of hardcoded UUIDs
**Chosen**: All IDs live in a single exported `SEED_IDS` constant in `src/mock/seed/ids.ts`. Every other seed file imports from it. No raw UUID string literals anywhere else.
**Why**: Prevents drift, makes cross-entity references self-documenting, and ensures a future refactor only touches one file.
**Alternative considered**: Inline IDs in each seed file. Rejected — breaks the invariant that cross-references are traceable.

### Decision 3 — Junction records need IDs in SEED_IDS
**Chosen**: `SEED_IDS.groupRepos` holds an `id` for each `GroupDoctor`, `GroupMedicalCenter`, `GroupInsurer`, and `GroupPharmacy` record (required by the spec interface `id: string`).
**Why**: The spec's junction interfaces include `id`. These IDs will never be referenced by other entities, but they must be unique and stable for soft-delete to work correctly in mock services.

### Decision 4 — Split group-repositories into 4 typed arrays
**Chosen**: `group-repositories.ts` exports `mockGroupDoctors: GroupDoctor[]`, `mockGroupMedicalCenters: GroupMedicalCenter[]`, `mockGroupInsurers: GroupInsurer[]`, `mockGroupPharmacies: GroupPharmacy[]` — all as `let`.
**Why**: Matches the separate service methods (getGroupDoctors, getGroupMedicalCenters, etc.) and allows independent in-memory mutation without array-union type gymnastics.
**Consequent change**: `src/mock/index.ts` drops `mockGroupRepositories` and exports the four new names.

### Decision 5 — Helper signatures follow existing stubs where non-breaking
- `resolveMember` already has the correct signature in the current placeholder (uses `'account'`/`'non-account'` strings); update to use `'user'`/`'nonAccount'` after the type sync
- `getActiveMedications` existing stub takes a `HealthProfile` — **change signature** to take `(memberId, memberType, healthProfiles)` and return `PermanentMedication[]` for the active ones (those with no `discontinuedAt`). The user's description includes "permanentMedications from HealthProfile" — since `PermanentMedication` in the spec has no `durationDays`, only `discontinuedAt` marks removal, so "active" = not discontinued
- `getUpcomingAppointments` existing stub already matches the intended signature; keep it and adjust string literals for `status`

### Decision 6 — Plaintext passwords in passwordHash
**Chosen**: Store plain text (e.g., `'Admin123!'`) in the `passwordHash` field.
**Why**: The mock auth service compares `user.passwordHash === inputPassword` directly. There is no real hashing in the prototype. The field name is retained as-is from the spec to avoid a type change.

## Risks / Trade-offs

- **Type sync blast radius** → Any in-progress code that imports from `src/types` will need to be updated alongside the type sync. Mitigation: do the type sync as an isolated first task and run `tsc` immediately after before touching seed files.
- **Group repositories export rename** → If any existing code already imports `mockGroupRepositories`, it will break. Mitigation: search for `mockGroupRepositories` usages before renaming; replace in the same commit.
- **ExamStatus `'withResults'`** → The spec defines this value but the current stale types.ts only has `'pending' | 'completed'`. After the type sync this resolves automatically.
- **HealthProfile has no `isActive`** — `NonAccountMember` in the spec also lacks `isActive` (only `deletedAt`). Do not add it.
