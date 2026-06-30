## Why

The prototype scaffolding exists but all mock data files contain empty arrays and placeholder helpers, making it impossible to render any screen. Populating the seed layer with consistent, relation-aware test data unblocks all feature development and manual QA.

## What Changes

- `src/mock/seed/ids.ts` — new file with all hardcoded SEED_IDS (single source of truth for UUIDs)
- `src/mock/seed/users.seed.ts` — 6 users covering every auth/role scenario
- `src/mock/seed/groups.seed.ts` — 2 groups (active + inactive)
- `src/mock/seed/non-account-members.seed.ts` — 2 members (human minor + pet)
- `src/mock/seed/specialties.seed.ts` — 6 medical specialties
- `src/mock/seed/doctors.seed.ts` — 4 doctors (2 global, 2 group-propagated)
- `src/mock/seed/medical-centers.seed.ts` — 3 centers (clinic, hospital, lab)
- `src/mock/seed/insurers.seed.ts` — 2 insurers
- `src/mock/seed/pharmacies.seed.ts` — 2 pharmacies
- `src/mock/seed/group-repositories.seed.ts` — group-scoped junction records for Familia García
- `src/mock/seed/health-profiles.seed.ts` — 5 health profiles (3 users + 2 non-account)
- `src/mock/seed/appointments.seed.ts` — 5 appointments (completed + scheduled, user + non-account)
- `src/mock/seed/consultation-results.seed.ts` — 2 consultation results with prescribed medications
- `src/mock/seed/auxiliary-exams.seed.ts` — 3 exams (pending, with results, standalone)
- `src/mock/seed/free-notes.seed.ts` — 3 notes (with title + without)
- `src/mock/helpers/resolveMember.ts` — replaces placeholder, resolves User|NonAccountMember by id+type
- `src/mock/helpers/getActiveMedications.ts` — replaces placeholder, returns active prescriptions + permanents
- `src/mock/helpers/getUpcomingAppointments.ts` — replaces placeholder, filters scheduled appointments within config window
- `src/mock/index.ts` — updated to re-export all arrays by name

## Capabilities

### New Capabilities

- `mock-seed-data`: Complete in-memory mock dataset covering all prototype screens and data relationships, including all seed arrays, SEED_IDS registry, and query helpers.

### Modified Capabilities

*(none — no spec-level behavior changes, only implementation of existing stubs)*

## Impact

- **Files modified**: `src/mock/index.ts`, all files in `src/mock/seed/`, all files in `src/mock/helpers/`
- **No API or type changes**: all objects must conform to existing `src/types/index.ts` interfaces without modification
- **No new dependencies**: pure TypeScript, no external packages
- **Dev/QA impact**: every prototype screen becomes renderable once this is merged; service-layer code that already imports from `src/mock/` will work without changes
