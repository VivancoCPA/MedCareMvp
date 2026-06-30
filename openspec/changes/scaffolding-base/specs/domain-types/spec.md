## ADDED Requirements

### Requirement: All domain enums are defined and exported from src/types/index.ts
`src/types/index.ts` SHALL export the following string enums or string union types: `UserRole` (`'superadmin' | 'admin' | 'member'`), `BloodType` (A+, A-, B+, B-, AB+, AB-, O+, O-), `Gender` (`'male' | 'female' | 'other'`), `MemberType` (`'account' | 'non-account'`), `NonAccountMemberType` (`'minor' | 'dependent'`), `AppointmentStatus` (`'scheduled' | 'completed' | 'cancelled'`), `ExamType` (`'lab' | 'imaging' | 'other'`), `ExamStatus` (`'pending' | 'completed'`), `MedicalCenterType` (`'clinic' | 'hospital' | 'lab' | 'imaging_center' | 'pharmacy' | 'other'`), `FileType` (`'pdf' | 'image'`).

#### Scenario: UserRole type is usable as a discriminant
- **WHEN** a variable is typed as `UserRole`
- **THEN** TypeScript enforces it can only be one of `'superadmin'`, `'admin'`, or `'member'`

#### Scenario: MemberType discriminates member lookup
- **WHEN** code checks `memberType === 'account'`
- **THEN** TypeScript narrows the member to a `User` type in that branch

### Requirement: All domain interfaces are defined and exported
`src/types/index.ts` SHALL export the following interfaces: `User` (id, email, passwordHash, role: UserRole, firstName, lastName, phone?, avatarUrl?, isActive, deletedAt?, createdAt), `Group` (id, name, adminId, isActive, deletedAt?, createdAt), `NonAccountMember` (id, groupId, memberType: NonAccountMemberType, firstName, lastName, birthDate?, gender?, avatarUrl?, isActive, deletedAt?, createdAt), `Doctor` (id, name, specialtyId, licenseNumber?, phone?, email?, isActive, deletedAt?), `Specialty` (id, name, isActive), `MedicalCenter` (id, name, type: MedicalCenterType, address?, phone?, isActive, deletedAt?), `Insurer` (id, name, phone?, email?, isActive, deletedAt?), `Pharmacy` (id, name, address?, phone?, isActive, deletedAt?), `GroupDoctor`, `GroupMedicalCenter`, `GroupInsurer`, `GroupPharmacy` (junction tables with groupId, entityId, isActive, deletedAt?), `HealthProfile` (id, memberId, memberType: MemberType, bloodType?, allergies?, permanentMedications: PermanentMedication[], notes?, groupId), `Appointment` (id, memberId, memberType: MemberType, groupId, doctorId?, medicalCenterId?, scheduledAt: string, status: AppointmentStatus, reason?, notes?, deletedAt?, createdAt), `ConsultationResult` (id, appointmentId, memberId, memberType: MemberType, groupId, diagnosis?, treatment?, prescribedMedications: PrescribedMedication[], attachments: ExamAttachment[], notes?, deletedAt?, createdAt), `AuxiliaryExam` (id, memberId, memberType: MemberType, groupId, type: ExamType, status: ExamStatus, orderedAt: string, resultDate?, attachments: ExamAttachment[], notes?, deletedAt?, createdAt), `FreeNote` (id, memberId, memberType: MemberType, groupId, title, content, tags: string[], deletedAt?, createdAt).

#### Scenario: User interface requires role field
- **WHEN** an object literal is typed as `User`
- **THEN** TypeScript requires the `role` field to be of type `UserRole`

#### Scenario: HealthProfile links member via memberType discriminant
- **WHEN** a HealthProfile is used
- **THEN** code accessing `healthProfile.memberType` can branch on `'account'` vs `'non-account'` to determine which entity table to look up

### Requirement: Sub-interfaces are defined for nested data structures
`src/types/index.ts` SHALL export: `PermanentMedication` (id, name, dosage, frequency, startDate: string, discontinuedAt?: string, notes?), `PrescribedMedication` (name, dosage, frequency, durationDays?, notes?), `ExamAttachment` (id, fileName, fileType: FileType, url, uploadedAt: string).

#### Scenario: PermanentMedication is distinguishable as active or discontinued
- **WHEN** code checks `medication.discontinuedAt === undefined`
- **THEN** the medication is considered active (no separate `isActive` boolean is needed)

### Requirement: All interfaces enforce soft-delete via optional deletedAt
Any interface representing a persisted entity that can be removed SHALL include `deletedAt?: string` (ISO 8601). There MUST be no `isDeleted: boolean` field — soft-delete state is derived from `deletedAt !== undefined`.

#### Scenario: Deleted entity has deletedAt set
- **WHEN** an entity is soft-deleted
- **THEN** `entity.deletedAt` is set to an ISO 8601 timestamp and the entity remains in the data store

#### Scenario: Active entity has no deletedAt value
- **WHEN** checking if a User is active
- **THEN** code checks `user.deletedAt === undefined`, not a boolean flag

### Requirement: All date fields in domain interfaces use ISO 8601 string type
Date fields in interfaces SHALL be typed as `string` with the semantic convention of ISO 8601. No `Date` object type SHALL appear in domain interfaces. This ensures serialization safety across localStorage, mock data, and API responses.

#### Scenario: Date field is typed as string
- **WHEN** accessing `appointment.scheduledAt`
- **THEN** TypeScript infers the type as `string`, not `Date`
