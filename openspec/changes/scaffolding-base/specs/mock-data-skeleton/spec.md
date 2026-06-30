## ADDED Requirements

### Requirement: Mock data is accessible only through a central re-export
`src/mock/index.ts` SHALL re-export all seed arrays as named exports. Components and hooks MUST NOT import directly from `src/mock/seed/*.ts` — they SHALL import from `services/` layer only. This rule ensures mock data and real API calls are swapped at the service layer without touching components.

#### Scenario: Mock data is accessed via the central export
- **WHEN** a service file needs mock data for users
- **THEN** it imports from `src/mock/index.ts` (e.g., `import { mockUsers } from '@/mock'`), not from `src/mock/seed/users.ts` directly

### Requirement: Seed files exist for all domain entities as empty arrays
The `src/mock/seed/` directory SHALL contain typed seed files for every entity. Each file MUST export an empty typed array at scaffolding time. Required files: `users.ts`, `groups.ts`, `non-account-members.ts`, `health-profiles.ts`, `specialties.ts`, `doctors.ts`, `medical-centers.ts`, `insurers.ts`, `pharmacies.ts`, `group-repositories.ts`, `appointments.ts`, `consultation-results.ts`, `auxiliary-exams.ts`, `free-notes.ts`.

#### Scenario: Seed file exports a typed array
- **WHEN** `src/mock/seed/users.ts` is imported
- **THEN** it exports a value of type `User[]` (or `Readonly<User[]>`) that is initially empty

### Requirement: Mock helpers are fully implemented and type-safe
The `src/mock/helpers/` directory SHALL contain three complete helper functions: `resolveMember(memberId, memberType, users, nonAccountMembers)` returns a `User | NonAccountMember | undefined` by looking up in the correct array based on `memberType` — it MUST NEVER assume `memberId` belongs to a User without checking `memberType`; `getActiveMedications(healthProfile)` returns `PermanentMedication[]` that are active (not discontinued); `getUpcomingAppointments(appointments, withinDays)` returns `Appointment[]` scheduled within the next `withinDays` days where `withinDays` defaults to `APP_CONFIG.dashboard.upcomingAppointmentsDays`.

#### Scenario: resolveMember returns User for account member type
- **WHEN** `resolveMember(id, 'account', users, nonAccountMembers)` is called
- **THEN** it searches the `users` array and returns the matching User or undefined

#### Scenario: resolveMember returns NonAccountMember for non-account type
- **WHEN** `resolveMember(id, 'non-account', users, nonAccountMembers)` is called
- **THEN** it searches the `nonAccountMembers` array and returns the matching NonAccountMember or undefined

#### Scenario: resolveMember never assumes memberType is account
- **WHEN** `resolveMember` is called with a `memberType` that is not `'account'`
- **THEN** it does NOT search the `users` array, regardless of whether a matching user ID exists there

#### Scenario: getActiveMedications filters out discontinued medications
- **WHEN** a HealthProfile contains a mix of active and discontinued PermanentMedications
- **THEN** `getActiveMedications` returns only the non-discontinued entries

#### Scenario: getUpcomingAppointments filters by date window
- **WHEN** appointments exist with dates both inside and outside the window
- **THEN** `getUpcomingAppointments` returns only appointments within the next `withinDays` days from today

### Requirement: Dates in mock data use ISO 8601 format
All date values in seed files and helpers MUST be ISO 8601 strings. The helpers MUST use `formatDate()`/`formatDateTime()` from `src/lib/utils.ts` for any date formatting in UI-facing outputs.

#### Scenario: Seed date values are ISO 8601
- **WHEN** a seed file contains a date field (e.g., `birthDate`, `scheduledAt`)
- **THEN** the value is a string matching the pattern `YYYY-MM-DD` or `YYYY-MM-DDTHH:mm:ssZ`
