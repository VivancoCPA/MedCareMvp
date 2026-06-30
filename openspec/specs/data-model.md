# Spec: Data Model — MedFamilyCare

## Purpose

Define all TypeScript types and entity shapes used across the application.
This is the single source of truth for data structures.

## Enums & Union Types

```typescript
export type UserRole = "superadmin" | "admin" | "member";
export type BloodType =
  | "A+"
  | "A-"
  | "B+"
  | "B-"
  | "AB+"
  | "AB-"
  | "O+"
  | "O-"
  | "unknown";
export type Gender = "male" | "female" | "other" | "unspecified";
export type MemberType = "user" | "nonAccount";
export type NonAccountMemberType = "human" | "pet" | "other";
export type AppointmentStatus =
  | "scheduled"
  | "completed"
  | "cancelled"
  | "rescheduled";
export type ExamType = "laboratory" | "imaging" | "other";
export type ExamStatus = "pending" | "completed" | "withResults";
export type MedicalCenterType =
  | "clinic"
  | "hospital"
  | "office"
  | "laboratory"
  | "other";
export type FileType = "pdf" | "image";
```

## Embedded Sub-types

```typescript
export interface PermanentMedication {
  name: string;
  dose: string;
  frequency: string;
}

export interface PrescribedMedication {
  id: string;
  name: string;
  dose: string;
  frequency: string;
  durationDays: number | null;
  startDate: string | null;
  pharmacyId: string | null;
}

export interface ExamAttachment {
  id: string;
  fileName: string;
  fileType: FileType;
  fileSizeBytes: number;
  mimeType: string;
  url: string;
  uploadedAt: string;
}
```

## Core Entities

### User

```typescript
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  mustChangePassword: boolean;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: Gender;
  phone: string | null;
  role: UserRole;
  groupId: string | null;
  isActive: boolean;
  shareHCWithPreviousGroup: boolean;
  previousGroupId: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
```

### Group

```typescript
export interface Group {
  id: string;
  name: string;
  adminId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
```

### NonAccountMember

```typescript
export interface NonAccountMember {
  id: string;
  groupId: string;
  firstName: string;
  lastName: string | null;
  birthDate: string | null;
  gender: Gender;
  memberType: NonAccountMemberType;
  breed: string | null;
  bloodType: BloodType | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
```

### Doctor

```typescript
export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  specialtyId: string;
  phone: string | null;
  email: string | null;
  medicalLicense: string | null;
  originGroupId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
```

### Specialty

```typescript
export interface Specialty {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
```

### MedicalCenter

```typescript
export interface MedicalCenter {
  id: string;
  name: string;
  type: MedicalCenterType;
  address: string | null;
  phone: string | null;
  originGroupId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
```

### Insurer

```typescript
export interface Insurer {
  id: string;
  name: string;
  phone: string | null;
  website: string | null;
  originGroupId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
```

### Pharmacy

```typescript
export interface Pharmacy {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  originGroupId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
```

### Group Repository Tables (reference only — no data duplication)

```typescript
export interface GroupDoctor {
  id: string;
  groupId: string;
  doctorId: string;
  isActive: boolean;
  createdAt: string;
}

export interface GroupMedicalCenter {
  id: string;
  groupId: string;
  medicalCenterId: string;
  isActive: boolean;
  createdAt: string;
}

export interface GroupInsurer {
  id: string;
  groupId: string;
  insurerId: string;
  isActive: boolean;
  createdAt: string;
}

export interface GroupPharmacy {
  id: string;
  groupId: string;
  pharmacyId: string;
  isActive: boolean;
  createdAt: string;
}
```

### HealthProfile

```typescript
export interface HealthProfile {
  id: string;
  groupId: string;
  memberId: string;
  memberType: MemberType;
  bloodType: BloodType | null;
  allergies: string[];
  chronicConditions: string[];
  permanentMedications: PermanentMedication[];
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
```

### Appointment

```typescript
export interface Appointment {
  id: string;
  groupId: string;
  memberId: string;
  memberType: MemberType;
  doctorId: string | null;
  medicalCenterId: string | null;
  insurerId: string | null;
  specialtyId: string | null;
  scheduledAt: string;
  status: AppointmentStatus;
  reason: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
```

### ConsultationResult

```typescript
export interface ConsultationResult {
  id: string;
  appointmentId: string;
  groupId: string;
  memberId: string;
  memberType: MemberType;
  diagnosis: string;
  indications: string | null;
  medications: PrescribedMedication[];
  nextAppointmentDate: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
```

### AuxiliaryExam

```typescript
export interface AuxiliaryExam {
  id: string;
  groupId: string;
  memberId: string;
  memberType: MemberType;
  appointmentId: string | null;
  type: ExamType;
  name: string;
  status: ExamStatus;
  orderedAt: string;
  resultDate: string | null;
  notes: string | null;
  attachments: ExamAttachment[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
```

### FreeNote

```typescript
export interface FreeNote {
  id: string;
  groupId: string;
  memberId: string;
  memberType: MemberType;
  title: string | null;
  body: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
```

## Polymorphic Member Pattern

All entities with `memberId` + `memberType` follow this resolution pattern:

```typescript
// NEVER assume memberId always points to a User.
// ALWAYS check memberType first.
function resolveMember(
  memberId: string,
  memberType: MemberType,
  users: User[],
  nonAccountMembers: NonAccountMember[],
): User | NonAccountMember {
  if (memberType === "user") {
    return users.find((u) => u.id === memberId)!;
  }
  return nonAccountMembers.find((m) => m.id === memberId)!;
}
```

## Data Integrity Rules

- Email must be unique across all users
- A user can only belong to one group at a time (`groupId` is unique per active user)
- The Admin's `groupId` points to their own group (they are also a member)
- `ConsultationResult` can only be created when `Appointment.status === 'completed'`
- One appointment can have at most one `ConsultationResult`
- All entities use soft-delete: `deletedAt` field, never physical delete from UI
- PDF attachments: max 3 MB. Image attachments: max 4 MB.
- All dates stored as ISO 8601 UTC strings. Format for display only in UI layer.
