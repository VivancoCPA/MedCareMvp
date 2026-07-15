## Context

`src/router/index.tsx` already declares the five `/superadmin` catalog routes
(`doctors`, `specialties`, `medical-centers`, `insurers`, `pharmacies`) as
`placeholder()` elements, and `src/mock/seed/*.ts` already seeds all five entities
(`mockDoctors`, `mockSpecialties`, `mockMedicalCenters`, `mockInsurers`,
`mockPharmacies`), each with `isActive`, `originGroupId`, and audit timestamp fields.
`src/features/repositories-universal/` exists as an empty scaffold directory. No
feature besides `auth` has a real service/hook/page implementation yet, so this
change also establishes the reference pattern that later features (appointments,
health-profile, group-repositories) will copy.

Two shared components the feature depends on are currently no-op stubs:
`src/components/shared/ConfirmModal.tsx` (`return null`) and
`src/components/shared/StatusBadge.tsx` (`return null`). `src/hooks/useToast.ts` is
also a stub (`toast: (_message: string) => undefined`) sitting on top of the fully
functional shadcn `useToast`/`toast` in `src/hooks/use-toast.ts`. All three must
become real before any catalog page can show a working confirm-dialog, status badge,
or success/error feedback.

The current `src/types/index.ts` / `openspec/specs/data-model.md` definitions were
checked against the original feature request and two gaps were found:
- `Specialty` has no `description` field.
- `Insurer` has `phone`, not the `emergencyPhone` the UI is meant to label.
- `Doctor` has `firstName`/`lastName` (no `fullName`) and no relation to
  `MedicalCenter` at all (no `medicalCenterIds`, no `DoctorMedicalCenter` junction
  type). The only medical-center junction that exists is `GroupMedicalCenter`
  (group ↔ center, for group-repository propagation), unrelated to "where a doctor
  practices."

## Goals / Non-Goals

**Goals:**
- One consistent list+modal CRUD pattern, implemented once and repeated
  identically five times (doctors, specialties, medical centers, insurers,
  pharmacies).
- Real-time client-side search (debounced) and status filter, computed in the
  list component with `useMemo` — services and hooks stay dumb data fetchers.
- Soft-delete via `isActive` toggle only; `deletedAt` is never written by this
  feature (reserved for a future physical-delete capability, out of scope).
- Turn `ConfirmModal`, `StatusBadge`, and `useToast` from stubs into reusable
  primitives usable by every future feature, not just this one.

**Non-Goals:**
- Doctor ↔ medical center association (no data model support; see Context).
- Physical/hard delete of any catalog record.
- Server-side pagination, sorting, or search (mock layer holds the full array
  in memory; five catalogs are small enough for full-table filtering).
- Group-scoped repository screens (`mc-s08`) — this change only builds the
  SuperAdmin-global catalogs those will read from.
- Any change to `Appointment`, `HealthProfile`, or other features that
  reference `doctorId`/`specialtyId`/`medicalCenterId`/`insurerId` by id — those
  ids remain valid, only the universal-catalog CRUD UI is new.

## Decisions

### 1. One capability spec, five entities, one shared contract

All five entities implement the same `RepositoryService<T, CreateDTO, UpdateDTO>`
shape:

```typescript
interface RepositoryService<T, CreateDTO, UpdateDTO> {
  getAll(): Promise<T[]>
  getById(id: string): Promise<T>
  create(data: CreateDTO): Promise<T>
  update(id: string, data: UpdateDTO): Promise<T>
  deactivate(id: string): Promise<T>   // isActive = false, updatedAt = now, deletedAt untouched
  reactivate(id: string): Promise<T>   // isActive = true, updatedAt = now
}
```

Each service file (`doctors.service.ts`, etc.) is the *only* code that imports its
`src/mock/seed/*` array. It mutates the in-memory array directly (same pattern as
`auth.service.ts`'s `mockUsers`), applies `await delay(APP_CONFIG.mock.simulatedDelayMs)`
on every method, and throws a plain `Error` on not-found rather than inventing a new
per-entity error-code enum (unlike `auth.service.ts`, these are internal CRUD ops
with no user-facing distinct failure modes to branch on).

Each hook (`useDoctors.ts`, etc.) wraps its service with one `useQuery` +
four `useMutation`s (create/update/deactivate/reactivate), all invalidating the
same `queryKey` on success, and calling `useToast().toast(...)` on both success and
error. Filtering by search text and status lives in the *page* component via
`useMemo` over the hook's `data` — never in the hook or service (`R2` in the
proposal's restated rules).

**Alternative considered**: a single generic `createRepositoryService<T>(seed)`
factory to eliminate the ~30 lines of repeated CRUD boilerplate per entity.
Rejected for this change — the proposal is explicit that the repetition is
deliberate ("para que los cambios futuros sean predecibles"), and a shared
generic would hide the one line that actually differs per entity (which seed
array it closes over) behind an abstraction with no other consumer yet. Revisit
if a sixth catalog is ever added.

### 2. Data model changes are additive/renames only, applied directly (not via delta spec)

`openspec/specs/data-model.md` is a flat reference document (no
`### Requirement:`/`#### Scenario:` structure), not an OpenSpec-tracked capability —
so its update happens as a direct edit during `tasks.md`/apply, not as a delta spec
file. Two changes, both confirmed safe by grepping the codebase for existing
consumers (none found outside seed data):

- Add `description: string | null` to `Specialty` (`src/types/index.ts`,
  `data-model.md`) and set it to `null` on the 6 existing seed rows in
  `src/mock/seed/specialties.ts`.
- Rename `Insurer.phone` → `Insurer.emergencyPhone` (type, data-model.md, and the
  2 seed rows in `src/mock/seed/insurers.ts`). No rename shim — nothing else
  reads this field yet.

`Doctor` and `MedicalCenter` types are **not** changed: the proposal's `fullName`
and `medicalCenterIds` fields are dropped (see proposal § "Descoped").

### 3. Doctor form/table use `firstName` + `lastName` directly

The Doctor form has two text inputs ("Nombre", "Apellido") instead of one
"Nombre completo" input, matching the `Doctor` type exactly — no derived/split
string parsing on submit. The table's "Nombre" column renders
`${firstName} ${lastName}`.

### 4. Real `ConfirmModal`, `StatusBadge`, `useToast`

- `ConfirmModal` becomes a thin wrapper around the existing `Dialog` primitive
  (`src/components/ui/dialog.tsx`), taking `open`, `title`, `message`,
  `confirmLabel`, `cancelLabel`, `onConfirm`, `onCancel`, `isLoading?` — generic
  enough for every future confirm-before-destructive-action use case, not just
  deactivate/reactivate.
- `StatusBadge` becomes a thin wrapper around the existing `Badge` primitive
  (`src/components/ui/badge.tsx`), taking `isActive: boolean` and rendering the
  Activo/Inactivo tokens/copy from `t('repositories.common.statusActive'|'statusInactive')`.
  Kept generic (bool in, badge out) so `users`/`groups` features can reuse it later
  instead of hand-rolling their own active/inactive badge.
- `useToast` (the project wrapper, not the shadcn generated `use-toast.ts`) gains a
  real body: `toast({ variant: 'default' | 'destructive', title, description? })`
  calling straight through to the shadcn `toast()`. This is the only file under
  `src/hooks/` this change touches; `use-toast.ts` (shadcn-generated) is left as-is.
- Two new shadcn primitives are added (not modifications to existing `ui/*` files,
  so ADR-001 doesn't apply): `ui/textarea.tsx` (Specialty description field) and
  `ui/skeleton.tsx` (table loading rows). Both follow the same "copied, not
  customized" shadcn convention as the existing `ui/*` files, wired to the same
  Tailwind alias tokens described in `tailwind.config.js`.

### 5. i18n: extend `repositories.*` and `validation.*`, don't duplicate

`en.json`/`es.json` already reserve an empty `"repositories": {}` key and a
non-empty `"validation"` object (`required`, `email`, `password.*`). This change
fills in `repositories.common` + one block per entity, and *adds* to the existing
`validation` object (`minLength`, `invalidUrl`, `atLeastOne`) rather than
introducing a second `required`/`invalidEmail` key that would collide with the
existing `validation.required` / `validation.email`. Zod schemas call
`t('validation.required')`, `t('validation.email')`, `t('validation.minLength', { min })`,
`t('validation.invalidUrl')`.

### 6. Origin badge reuses `signature-peach` token, not a new color

"Propagado" (Doctor origin badge) reuses `bg-[--color-signature-peach]`, an
existing token, matching the design system rule (R5) of no new hex values.
"SuperAdmin" origin renders as plain muted text, not a badge (avoids implying two
competing badge systems in the same column as the Activo/Inactivo status badge).

## Risks / Trade-offs

- **[Risk]** Five near-identical service/hook/component sets increase the chance
  of one silently drifting from the pattern during future edits (e.g. someone
  fixes a bug in `doctors.service.ts` but forgets the same fix in
  `pharmacies.service.ts`).
  → **Mitigation**: `specs/repositories-universal/spec.md` states the shared
  contract as its own testable requirement, independent of the per-entity field
  requirements, so drift shows up as a spec violation.
- **[Risk]** Renaming `Insurer.phone` → `emergencyPhone` and adding
  `Specialty.description` touches the shared `data-model.md` reference doc used
  by other in-flight/future changes.
  → **Mitigation**: confirmed via grep that no other feature currently reads
  either field; both are net-new consumption in this change only.
- **[Risk]** Dropping the doctor↔medical-center relationship differs from the
  original request text.
  → **Mitigation**: called out explicitly in proposal.md and here, with the
  concrete reason (no supporting type/junction exists) — a future change can add
  a `DoctorMedicalCenter` junction table the same way `GroupMedicalCenter` exists,
  if that relation turns out to be needed.
- **[Risk]** `ConfirmModal`/`StatusBadge`/`useToast` are shared, not owned by this
  feature — a bug in their new implementation affects every future screen that
  adopts them, not just these five catalogs.
  → **Mitigation**: covered by `shared-page-components` delta spec requirements
  with explicit scenarios, same rigor as the catalog-specific requirements.

## Open Questions

- None blocking. The doctor↔medical-center relation (descoped above) is the one
  item worth revisiting if `mc-s08-feature-group-repositories` turns out to need
  it — flagged there as a dependency risk, not resolved here.
