# mock-seed-data Specification

## Purpose
TBD - created by archiving change seed-data. Update Purpose after archive.

## Requirements
### Requirement: SEED_IDS registry
The system SHALL provide a single `src/mock/seed/ids.ts` file that exports a `SEED_IDS` constant object containing all hardcoded UUID strings used across seed files. No other seed file SHALL contain raw UUID string literals that are referenced by other files.

#### Scenario: SEED_IDS covers all entities
- **WHEN** a developer imports `SEED_IDS` from `src/mock/seed/ids.ts`
- **THEN** they can access UUIDs for users, groups, nonAccountMembers, specialties, doctors, medicalCenters, insurers, pharmacies, appointments, and groupRepos without any raw strings elsewhere

#### Scenario: No UUID duplication across files
- **WHEN** `npx tsc --noEmit` and a grep for hardcoded UUID patterns (e.g. `'u-00`, `'g-00`) runs across all seed files excluding `ids.ts`
- **THEN** zero matches are found in any seed file other than `ids.ts`

### Requirement: Mutable seed arrays
All seed arrays SHALL be declared with `let` (not `const`) so that mock service functions can reassign or splice them to simulate create/update/delete within a session.

#### Scenario: Array is reassignable
- **WHEN** a mock service does `mockUsers = mockUsers.filter(u => u.id !== id)`
- **THEN** the module-level binding is updated without a TypeScript error

### Requirement: Types file matches data-model spec
`Med-care/src/types/index.ts` SHALL be a verbatim TypeScript translation of `openspec/specs/data-model.md`. Running `npx tsc --noEmit` in `Med-care/` SHALL report zero errors after the types file and all seed files are in place.

#### Scenario: Type sync verification
- **WHEN** `npx tsc --noEmit` runs in the `Med-care/` directory
- **THEN** exit code is 0 and stderr is empty

### Requirement: User seed data covers all auth scenarios
The `mockUsers` array SHALL contain exactly 6 users covering every authentication and role scenario needed by the prototype.

#### Scenario: Super admin exists
- **WHEN** the auth mock service looks up `superadmin@medfamilycare.com`
- **THEN** it finds a user with `role='superadmin'`, `isActive=true`, `groupId=null`

#### Scenario: Admin with active group
- **WHEN** the auth mock service looks up `admin.garcia@email.com`
- **THEN** it finds a user with `role='admin'`, `groupId=SEED_IDS.groups.familiaGarcia`, `mustChangePassword=false`, `isActive=true`

#### Scenario: Member with mustChangePassword flag
- **WHEN** the auth mock service looks up `carlos.garcia@email.com`
- **THEN** it finds a user with `role='member'`, `mustChangePassword=true`, `isActive=true`

#### Scenario: Inactive user is rejected at login
- **WHEN** the auth mock service looks up `admin.lopez@email.com`
- **THEN** it finds a user with `isActive=false` and login is denied

#### Scenario: Member without group
- **WHEN** the auth mock service looks up `usuario.singrupo@email.com`
- **THEN** it finds a user with `role='member'`, `groupId=null`, `isActive=true`

### Requirement: Group seed data covers active and inactive groups
The `mockGroups` array SHALL contain exactly 2 groups: one active (Familia García) and one active but administered by an inactive user (Familia López).

#### Scenario: Active group with active admin
- **WHEN** group-related mock service resolves `SEED_IDS.groups.familiaGarcia`
- **THEN** it finds a group with `name='Familia García'`, `adminId=SEED_IDS.users.adminGarcia`, `isActive=true`

### Requirement: Non-account member seed covers human minor and pet
The `mockNonAccountMembers` array SHALL contain exactly 2 members: one `memberType='human'` (minor child) and one `memberType='pet'`.

#### Scenario: Minor child member
- **WHEN** the member resolver looks up `SEED_IDS.nonAccount.sofiaGarcia` with `memberType='nonAccount'`
- **THEN** it returns a `NonAccountMember` with `firstName='Sofía'`, `memberType='human'`, `groupId=SEED_IDS.groups.familiaGarcia`

#### Scenario: Pet member has breed and null lastName
- **WHEN** the member resolver looks up `SEED_IDS.nonAccount.maxGarcia` with `memberType='nonAccount'`
- **THEN** it returns a `NonAccountMember` with `firstName='Max'`, `lastName=null`, `memberType='pet'`, `breed='Labrador'`

### Requirement: Doctor seed covers global and group-propagated doctors
The `mockDoctors` array SHALL contain 4 doctors: 2 with `originGroupId=null` (global) and 2 with `originGroupId=SEED_IDS.groups.familiaGarcia` (propagated from group admin).

#### Scenario: Group-propagated doctor
- **WHEN** the repository mock lists doctors for `SEED_IDS.groups.familiaGarcia`
- **THEN** `drTorres` and `draVega` appear with `originGroupId=SEED_IDS.groups.familiaGarcia`

### Requirement: Group repositories seed covers Familia García
The `mockGroupDoctors`, `mockGroupMedicalCenters`, `mockGroupInsurers`, and `mockGroupPharmacies` arrays SHALL each contain the junction records linking Familia García to its available providers.

#### Scenario: All 4 doctors in group repository
- **WHEN** the group doctor mock service queries for `groupId=SEED_IDS.groups.familiaGarcia`
- **THEN** it returns records linking all 4 doctor IDs to that group

#### Scenario: Both pharmacies in group repository
- **WHEN** the group pharmacy mock service queries for `groupId=SEED_IDS.groups.familiaGarcia`
- **THEN** it returns records for both Inkafarma and MiFarma

### Requirement: Health profiles cover all member types and scenarios
The `mockHealthProfiles` array SHALL contain 5 profiles — 3 for account users and 2 for non-account members — covering blood types, allergies, chronic conditions, and permanent medications.

#### Scenario: Profile with chronic conditions and allergies
- **WHEN** the health profile mock fetches `memberId=SEED_IDS.users.adminGarcia` with `memberType='user'`
- **THEN** it returns a profile with `bloodType='O+'`, `allergies=['Penicilina']`, `chronicConditions=['Hipertensión arterial']`, and one permanent medication (Losartán)

#### Scenario: Pet profile with null bloodType
- **WHEN** the health profile mock fetches `memberId=SEED_IDS.nonAccount.maxGarcia` with `memberType='nonAccount'`
- **THEN** it returns a profile with `bloodType=null`, `allergies=[]`, `chronicConditions=[]`

#### Scenario: Non-account minor with allergies and chronic condition
- **WHEN** the health profile mock fetches `memberId=SEED_IDS.nonAccount.sofiaGarcia`
- **THEN** it returns a profile with `allergies=['Polvo', 'Ácaros']` and `chronicConditions=['Asma leve intermitente']`

### Requirement: Appointment seed covers completed and scheduled scenarios
The `mockAppointments` array SHALL contain 5 appointments spanning both `status='completed'` and `status='scheduled'`, for both account users and non-account members.

#### Scenario: Completed appointment linked to consultation result
- **WHEN** the appointment mock fetches `SEED_IDS.appointments.cita001`
- **THEN** it returns an appointment with `status='completed'`, `memberId=SEED_IDS.users.adminGarcia`, `memberType='user'`

#### Scenario: Future scheduled appointment for dashboard
- **WHEN** the upcoming-appointments helper runs for group `SEED_IDS.groups.familiaGarcia` with a 90-day window
- **THEN** it returns cita002, cita004, and cita005 (all `status='scheduled'`, all in future)

#### Scenario: Scheduled appointment for non-account minor
- **WHEN** the appointment mock fetches `SEED_IDS.appointments.cita004`
- **THEN** it returns an appointment with `memberId=SEED_IDS.nonAccount.sofiaGarcia`, `memberType='nonAccount'`, `status='scheduled'`

### Requirement: Consultation results cover prescribed medications
The `mockConsultationResults` array SHALL contain 2 results, each with `prescribedMedications` including at least one permanent (null `durationDays`) and one time-limited medication.

#### Scenario: Result with permanent medication
- **WHEN** the consultation result mock fetches results for `appointmentId=SEED_IDS.appointments.cita001`
- **THEN** it returns a result with at least one medication where `durationDays=null` (Losartán)

#### Scenario: Result with finite medication
- **WHEN** the consultation result mock fetches results for `appointmentId=SEED_IDS.appointments.cita003`
- **THEN** it returns a result with medications where `durationDays` is a positive integer (Amoxicilina, Ibuprofeno)

### Requirement: Auxiliary exam seed covers pending, completed-with-results, and standalone scenarios
The `mockAuxiliaryExams` array SHALL contain 3 exams covering all status variants and the case of an exam without an appointment link.

#### Scenario: Pending exam highlighted for dashboard
- **WHEN** the exam mock queries pending exams for `SEED_IDS.users.memberCarlos`
- **THEN** it returns `ex-0002` with `status='pending'`, `attachments=[]`

#### Scenario: Standalone exam with no appointment
- **WHEN** the exam mock queries exams for `SEED_IDS.nonAccount.maxGarcia`
- **THEN** it returns `ex-0003` with `appointmentId=null` and `status='withResults'`

#### Scenario: Exam with PDF attachment
- **WHEN** the exam mock fetches `ex-0001`
- **THEN** it returns an exam with `attachments` containing one entry with `fileType='pdf'` and a non-empty `url`

### Requirement: Free notes seed covers titled and untitled notes
The `mockFreeNotes` array SHALL contain 3 notes — 2 with `title` set and 1 with `title=null`.

#### Scenario: Note with null title
- **WHEN** the free-notes mock fetches notes for `SEED_IDS.users.memberMaria`
- **THEN** it returns a note with `title=null` and a non-empty `body`

#### Scenario: Note for non-account member
- **WHEN** the free-notes mock fetches notes for `SEED_IDS.nonAccount.sofiaGarcia`
- **THEN** it returns `fn-0003` with a non-null `title` and `memberType='nonAccount'`

### Requirement: resolveMember helper returns correct entity by type
`resolveMember` SHALL take `(memberId, memberType, users, nonAccountMembers)` and return the matching entity or throw if not found.

#### Scenario: Resolves account user
- **WHEN** `resolveMember(SEED_IDS.users.memberMaria, 'user', mockUsers, mockNonAccountMembers)` is called
- **THEN** it returns the María García `User` object

#### Scenario: Resolves non-account member
- **WHEN** `resolveMember(SEED_IDS.nonAccount.sofiaGarcia, 'nonAccount', mockUsers, mockNonAccountMembers)` is called
- **THEN** it returns the Sofía García `NonAccountMember` object

#### Scenario: Throws on missing ID
- **WHEN** `resolveMember('nonexistent-id', 'user', mockUsers, mockNonAccountMembers)` is called
- **THEN** it throws an `Error` with the missing ID in the message

### Requirement: getActiveMedications returns only non-discontinued permanent medications
`getActiveMedications` SHALL take `(memberId, memberType, healthProfiles)` and return `PermanentMedication[]` containing only entries where `discontinuedAt` is undefined.

#### Scenario: Active permanent medication returned
- **WHEN** `getActiveMedications(SEED_IDS.users.adminGarcia, 'user', mockHealthProfiles)` is called
- **THEN** it returns the Losartán entry (no `discontinuedAt`)

#### Scenario: Member with no medications returns empty array
- **WHEN** `getActiveMedications(SEED_IDS.users.memberMaria, 'user', mockHealthProfiles)` is called
- **THEN** it returns `[]`

### Requirement: getUpcomingAppointments filters by scheduled status and date window
`getUpcomingAppointments` SHALL take `(appointments, withinDays?)` and return `Appointment[]` with `status='scheduled'` and `scheduledAt` within the next `withinDays` days, sorted ascending by `scheduledAt`.

#### Scenario: Only scheduled future appointments returned
- **WHEN** `getUpcomingAppointments(mockAppointments, 90)` is called on 2026-06-29
- **THEN** it returns cita002 (2026-07-10), cita004 (2026-06-20 — past, excluded), and cita005 (2026-07-05), sorted by `scheduledAt` ascending
- **THEN** cita001 and cita003 (status=completed) are excluded

#### Scenario: Optional groupId filter
- **WHEN** `getUpcomingAppointments(mockAppointments, 90, SEED_IDS.groups.familiaGarcia)` is called
- **THEN** only appointments with `groupId=SEED_IDS.groups.familiaGarcia` within the window are returned

### Requirement: mock/index.ts exports all arrays and helpers by name
`src/mock/index.ts` SHALL re-export every seed array and every helper function as a named export, including the 4 separate group-repository arrays (replacing the old `mockGroupRepositories`).

#### Scenario: All exports resolvable
- **WHEN** a module does `import { mockUsers, mockGroupDoctors, getUpcomingAppointments } from '@/mock'`
- **THEN** TypeScript resolves each import without error
