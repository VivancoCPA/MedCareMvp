// String union types
export type UserRole = 'superadmin' | 'admin' | 'member'
export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'unknown'
export type Gender = 'male' | 'female' | 'other' | 'unspecified'
export type MemberType = 'user' | 'nonAccount'
export type NonAccountMemberType = 'human' | 'pet' | 'other'
export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'rescheduled'
export type ExamType = 'laboratory' | 'imaging' | 'other'
export type ExamStatus = 'pending' | 'completed' | 'withResults'
export type MedicalCenterType = 'clinic' | 'hospital' | 'office' | 'laboratory' | 'other'
export type FileType = 'pdf' | 'image'

// Sub-interfaces
export interface PermanentMedication {
  name: string
  dose: string
  frequency: string
}

export interface PrescribedMedication {
  id: string
  name: string
  dose: string
  frequency: string
  durationDays: number | null
  startDate: string | null
  pharmacyId: string | null
}

export interface ExamAttachment {
  id: string
  fileName: string
  fileType: FileType
  fileSizeBytes: number
  mimeType: string
  url: string
  uploadedAt: string
}

// Core entity interfaces
export interface User {
  id: string
  email: string
  passwordHash: string
  mustChangePassword: boolean
  firstName: string
  lastName: string
  birthDate: string
  gender: Gender
  phone: string | null
  role: UserRole
  groupId: string | null
  isActive: boolean
  shareHCWithPreviousGroup: boolean
  previousGroupId: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface Group {
  id: string
  name: string
  adminId: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface NonAccountMember {
  id: string
  groupId: string
  firstName: string
  lastName: string | null
  birthDate: string | null
  gender: Gender
  memberType: NonAccountMemberType
  breed: string | null
  bloodType: BloodType | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface Specialty {
  id: string
  name: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface Doctor {
  id: string
  firstName: string
  lastName: string
  specialtyId: string
  phone: string | null
  email: string | null
  medicalLicense: string | null
  originGroupId: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface MedicalCenter {
  id: string
  name: string
  type: MedicalCenterType
  address: string | null
  phone: string | null
  originGroupId: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface Insurer {
  id: string
  name: string
  phone: string | null
  website: string | null
  originGroupId: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface Pharmacy {
  id: string
  name: string
  address: string | null
  phone: string | null
  originGroupId: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

// Junction interfaces
export interface GroupDoctor {
  id: string
  groupId: string
  doctorId: string
  isActive: boolean
  createdAt: string
}

export interface GroupMedicalCenter {
  id: string
  groupId: string
  medicalCenterId: string
  isActive: boolean
  createdAt: string
}

export interface GroupInsurer {
  id: string
  groupId: string
  insurerId: string
  isActive: boolean
  createdAt: string
}

export interface GroupPharmacy {
  id: string
  groupId: string
  pharmacyId: string
  isActive: boolean
  createdAt: string
}

// Health and activity interfaces
export interface HealthProfile {
  id: string
  groupId: string
  memberId: string
  memberType: MemberType
  bloodType: BloodType | null
  allergies: string[]
  chronicConditions: string[]
  permanentMedications: PermanentMedication[]
  notes: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface Appointment {
  id: string
  groupId: string
  memberId: string
  memberType: MemberType
  doctorId: string | null
  medicalCenterId: string | null
  insurerId: string | null
  specialtyId: string | null
  scheduledAt: string
  status: AppointmentStatus
  reason: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface ConsultationResult {
  id: string
  appointmentId: string
  groupId: string
  memberId: string
  memberType: MemberType
  diagnosis: string
  indications: string | null
  medications: PrescribedMedication[]
  nextAppointmentDate: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface AuxiliaryExam {
  id: string
  groupId: string
  memberId: string
  memberType: MemberType
  appointmentId: string | null
  type: ExamType
  name: string
  status: ExamStatus
  orderedAt: string
  resultDate: string | null
  notes: string | null
  attachments: ExamAttachment[]
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface FreeNote {
  id: string
  groupId: string
  memberId: string
  memberType: MemberType
  title: string | null
  body: string
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}
