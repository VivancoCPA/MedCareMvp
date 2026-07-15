## Context

`repositories-universal` (five catalogs: doctors, specialties, medical centers, insurers,
pharmacies) already ships with search, status filter, skeleton loading, deactivate-with-confirm,
and a `StatusBadge`/origin-badge pattern — all five `*List.tsx` files are structurally identical.
Client review found eight concrete defects/gaps in that existing implementation. This is a fix-up
pass, not new architecture: every decision below reuses an existing pattern already present in the
five lists rather than inventing a new one.

The client-supplied sync notes assumed a data shape that doesn't match the codebase (`Doctor.fullName`,
`Doctor.medicalCenterIds`, ad-hoc seed ids like `doc-005`). The actual `Doctor` type uses
`firstName`/`lastName` and has no medical-center relation (explicitly descoped in the original
proposal — group-to-entity junctions exist, doctor-to-center does not). This design follows the
real type (`src/types/index.ts`) and the real seed-id registry (`src/mock/seed/ids.ts`), not the
client's illustrative snippets.

## Goals / Non-Goals

**Goals:**
- Fix all eight client observations with minimal, additive changes to existing files.
- Keep the five catalogs structurally identical to each other (a fix applied to one pattern applies
  to all five list/page/modal trios).
- Root-cause the badge legibility bug rather than patching around it.

**Non-Goals:**
- No server-side pagination, sorting, or filtering — client-side only, consistent with the mock
  data layer.
- No real file upload/storage for avatar/logo — `URL.createObjectURL` only (same "simulated" scope
  as the rest of the mock backend).
- No doctor↔medical-center relation — still out of scope per the original proposal's descope note.
- No sidebar collapse control on tablet or mobile — tablet stays force-collapsed (space-constrained
  by design), mobile keeps its existing overlay open/close.

## Decisions

### Sidebar collapse: desktop-only manual override on top of the existing tier logic

`useSidebar()` currently derives `collapsed` purely from viewport tier (`collapsed = tier ===
'tablet'`); the `sidebarCollapsed` field already persisted in `ui.store.ts` is dead — nothing reads
it. Rather than adding new state, wire the existing field in:

```ts
const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed)
const toggleSidebarCollapsed = useUiStore((s) => s.toggleSidebar)
const collapsed = tier === 'tablet' || (tier === 'desktop' && sidebarCollapsed)
```

`useSidebar()` also returns `toggleSidebarCollapsed` and `tier`, so `Sidebar.tsx` can render its
footer toggle button only when `tier === 'desktop'` (mobile has no `collapsed` state — it's an
overlay; tablet's collapse is not user-controllable, so no toggle is shown there). `Shell.tsx`
already passes `collapsed` straight through to `Sidebar`, so no prop-shape change is needed there.

**Alternative considered**: give `Sidebar` its own local toggle state instead of reusing
`ui.store.ts`. Rejected — `sidebarCollapsed` already exists in the persisted store for exactly this
purpose (dead code from the original scaffold); using it avoids adding a second, competing notion of
"collapsed."

### Row height: `h-12` on `TableRow` + `py-0` on `TableCell`, applied uniformly

All five lists render `<TableRow><TableCell>` with default (unset) height, giving Shadcn's default
comfortable padding. Standardize to 48px total row height. This is a pure className change, applied
identically to all 10 files (5 `*List.tsx` header + body rows). Document the standard with a one-
line comment on the first `TableRow` of each file so future catalogs (e.g. a future `mc-s08` import
review table) follow it without re-deriving it.

### Reactivate confirmation: mirror the existing deactivate wiring exactly

Every `*ListPage.tsx` already holds `confirmTarget` / `isDeactivating` state and a `ConfirmModal`
for deactivate (see `DoctorListPage.tsx`). Add a parallel `reactivateTarget` / `isReactivating` pair
and a second `ConfirmModal`, and change each `*List.tsx`'s `onReactivate` prop from calling the
mutation directly to calling `setReactivateTarget(item)`. No new shared component — `ConfirmModal`
already supports this via a second instance, exactly as `ConfirmModal`'s existing single
responsibility (confirm/cancel a single pending action) intends.

### Status badge: replace the mint/forest token pair with an explicit, contrast-safe pair

Root cause confirmed in `globals.css`: for the active state, `--color-signature-mint` (background)
and `--color-signature-forest` (text) are:

| Theme | mint (bg) | forest (text) |
|---|---|---|
| Light | `#d7f3e3` | `#dbe7dd` |
| Dark | `#14342a` | `#1b2b21` |

Both pairs are near-identical lightness in their respective theme — the tokens were picked for hue,
not contrast, and nothing enforces a contrast ratio between them. Fix: `StatusBadge.tsx` keeps using
Tailwind's `dark:` variant (already enabled via `darkMode: ['class', '[data-theme="dark"]']` in
`tailwind.config.js`) but switches to an explicit, checked pair — `emerald-100`/`emerald-800` (light)
and `emerald-900/30`/`emerald-400` (dark) for active; `gray-100`/`gray-600` and `gray-800`/`gray-400`
for inactive — instead of the two design-system CSS variables. This is scoped to `StatusBadge.tsx`
only; the origin badge (`--color-signature-peach`) is untouched since it wasn't reported as illegible
and changing it isn't in scope.

**Alternative considered**: fix the token values in `globals.css` instead of bypassing them in
`StatusBadge`. Rejected — `--color-signature-mint`/`-forest` may be used elsewhere for their hue
(e.g. decorative accents where contrast against each other doesn't matter); changing the shared
tokens risks unrelated visual regressions. Scoping the fix to the one component with the actual bug
is safer.

### Avatar (Doctor) / Logo (Insurer): additive optional field + shared `getInitials` helper

Both follow one pattern: an optional nullable URL field on the entity, a preview in the form modal
(upload via `<input type="file">` → `URL.createObjectURL`, no persistence beyond the mock session),
and a column in the list with image-or-initials fallback. `getInitials()` goes in `src/lib/utils.ts`
next to `cn()` since both entities need it (doctor full name, insurer name) and it's pure/stateless.
Shape differs per entity per the client spec: circular 64px (modal) / 32px (list) for doctor avatar;
`rounded-md` 64×48 (modal) / 32×32 `object-contain` (list) for insurer logo, since a logo is
typically non-square and shouldn't be cropped to a circle.

**Alternative considered**: real upload to a mock "storage" service. Rejected — out of scope; no
other file field in the app (see `AuxiliaryExam.attachments`) does more than reference a URL, and
this MVP has no backend to persist blobs to.

### Pagination: one hook, reused across all five lists; page size sourced from config

`usePagination<T>(items, pageSize)` — plain client-side slice, mirroring the existing
`useMemo`-based `filtered` computation already in every `*List.tsx`. Page resets to 1 via a
`useEffect` keyed on `items.length` when the filtered set changes (search/status filter change) —
this is the same "effect reacts to an external change, not derived state" justification already
used for `useSidebar`'s location-based `sidebarOpen` reset.

`APP_CONFIG.pagination.defaultPageSize` already exists (currently `20`, unused). Change it to `10`
to match the client's requested standard and have `usePagination` default to it, keeping page size
single-sourced rather than hardcoding `10` in five call sites.

Controls use a new `src/components/ui/pagination.tsx` (Shadcn primitive, not present yet) — adding a
new `ui/*` file is allowed (ADR-001/013 forbid *modifying* existing `ui/*` files, not adding new
ones; the original `repositories-universal` change already added `textarea.tsx` and `skeleton.tsx`
this way).

### Seed data expansion

Extend `SEED_IDS` with new named keys (not the client's ad-hoc `doc-005` strings) to stay consistent
with the existing registry pattern in `src/mock/seed/ids.ts`. Target ≥12 doctors, ≥10 additional
records each for specialties/medical-centers/insurers/pharmacies, mixed `isActive`. `simulatedDelayMs`
goes 300 → 400ms so the skeleton (OBS-03) is reliably perceptible — this was already implemented
correctly (Skeleton exists in all five lists); only the delay threshold needed adjustment.

## Risks / Trade-offs

- [Risk] Hardcoding a new explicit color pair in `StatusBadge` diverges from the token-driven theme
  system used elsewhere. → Mitigation: scoped to one component with a documented reason (contrast
  bug), not a pattern to replicate elsewhere.
- [Risk] `URL.createObjectURL` object URLs are session-only (lost on refresh) and never revoked. →
  Mitigation: acceptable for a mock-data MVP with no persistence layer; matches the "simulated
  upload" scope explicitly requested.
- [Risk] Expanding seed data touches five files that other in-progress changes (e.g. `mc-s08`) may
  also depend on for fixture stability. → Mitigation: additive only (append records, no id reuse or
  removal); existing seed ids/records are untouched.

## Open Questions

- None — all eight observations map to a concrete, existing pattern in the codebase; no unresolved
  technical decisions remain.
