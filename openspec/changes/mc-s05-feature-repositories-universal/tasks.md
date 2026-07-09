## 1. Data model adjustments

- [x] 1.1 Add `description: string | null` to the `Specialty` interface in `src/types/index.ts`
- [x] 1.2 Rename `phone` to `emergencyPhone` on the `Insurer` interface in `src/types/index.ts`
- [x] 1.3 Update `openspec/specs/data-model.md` to match both changes (Specialty and Insurer sections)
- [x] 1.4 Update `src/mock/seed/specialties.ts` — add `description: null` to all 6 existing rows
- [x] 1.5 Update `src/mock/seed/insurers.ts` — rename `phone` to `emergencyPhone` on both existing rows

## 2. Shared component and hook implementations

- [x] 2.1 Add `src/components/ui/textarea.tsx` (shadcn Textarea primitive, wired to existing Tailwind alias tokens)
- [x] 2.2 Add `src/components/ui/skeleton.tsx` (shadcn Skeleton primitive)
- [x] 2.3 Implement `src/components/shared/ConfirmModal.tsx` — real `Dialog`-based confirm/cancel prompt (title, message, confirmLabel, cancelLabel, onConfirm, onCancel, isLoading)
- [x] 2.4 Implement `src/components/shared/StatusBadge.tsx` — real `Badge`-based Activo/Inactivo rendering from `isActive: boolean`
- [x] 2.5 Implement `src/hooks/useToast.ts` — real wrapper around `src/hooks/use-toast.ts`, exposing `toast({ variant, title, description? })`

## 3. i18n keys

- [x] 3.1 Fill in `repositories.common` in `src/i18n/locales/es.json` (status labels, filter, search placeholder, actions, cancel/save, origin labels, confirm title, toasts, empty state)
- [x] 3.2 Fill in `repositories.doctors`, `repositories.specialties`, `repositories.medicalCenters`, `repositories.insurers`, `repositories.pharmacies` in `es.json` (titles, field labels, modal titles, confirm messages)
- [x] 3.3 Extend the existing `validation` object in `es.json` with `minLength`, `invalidUrl`, `atLeastOne` (reuse existing `required` and `email` keys — do not duplicate them)
- [x] 3.4 Mirror all of the above in `src/i18n/locales/en.json` with English copy

## 4. Doctors catalog

- [x] 4.1 Create `src/features/repositories-universal/schemas/doctor.schema.ts` — Zod schema for `firstName`, `lastName`, `specialtyId` (required), `phone` (optional), `email` (optional email)
- [x] 4.2 Create `src/features/repositories-universal/services/doctors.service.ts` implementing the common `RepositoryService` contract over `mockDoctors`
- [x] 4.3 Create `src/features/repositories-universal/hooks/useDoctors.ts` (query + create/update/deactivate/reactivate mutations, toast on success/error)
- [x] 4.4 Create `src/features/repositories-universal/components/doctors/DoctorFormModal.tsx` (create/edit modal, specialty `Select` populated from `useSpecialties`)
- [x] 4.5 Create `src/features/repositories-universal/components/doctors/DoctorList.tsx` (table: Nombre, Especialidad resolved by name, Teléfono, Origen badge/text, Estado via `StatusBadge`, Editar/Desactivar-Reactivar actions; search + status filter via `useMemo`; skeleton rows while loading; `EmptyState` when filtered list is empty)
- [x] 4.6 Create `src/features/repositories-universal/pages/DoctorListPage.tsx` wiring `PageWrapper` + header + `DoctorList` + `DoctorFormModal` + `ConfirmModal` for deactivate confirmation

## 5. Specialties catalog

- [x] 5.1 Create `src/features/repositories-universal/schemas/specialty.schema.ts` — Zod schema for `name` (required) and `description` (optional)
- [x] 5.2 Create `src/features/repositories-universal/services/specialties.service.ts`
- [x] 5.3 Create `src/features/repositories-universal/hooks/useSpecialties.ts`
- [x] 5.4 Create `src/features/repositories-universal/components/specialties/SpecialtyFormModal.tsx` (name `Input`, description `Textarea`)
- [x] 5.5 Create `src/features/repositories-universal/components/specialties/SpecialtyList.tsx` (table: Nombre, Descripción truncated to 60 chars, Estado, actions; search + status filter; skeleton; empty state)
- [x] 5.6 Create `src/features/repositories-universal/pages/SpecialtyListPage.tsx`

## 6. Medical Centers catalog

- [x] 6.1 Create `src/features/repositories-universal/schemas/medical-center.schema.ts` — Zod schema for `name` (required), `type` (required enum), `address` (optional), `phone` (optional)
- [x] 6.2 Create `src/features/repositories-universal/services/medical-centers.service.ts`
- [x] 6.3 Create `src/features/repositories-universal/hooks/useMedicalCenters.ts`
- [x] 6.4 Create `src/features/repositories-universal/components/medical-centers/MedicalCenterFormModal.tsx` (name `Input`, type `Select` with 5 translated options, address/phone `Input`)
- [x] 6.5 Create `src/features/repositories-universal/components/medical-centers/MedicalCenterList.tsx` (table: Nombre, Tipo translated, Dirección, Teléfono, Estado, actions; search + status filter; skeleton; empty state)
- [x] 6.6 Create `src/features/repositories-universal/pages/MedicalCenterListPage.tsx`

## 7. Insurers catalog

- [x] 7.1 Create `src/features/repositories-universal/schemas/insurer.schema.ts` — Zod schema for `name` (required), `emergencyPhone` (optional), `website` (optional URL)
- [x] 7.2 Create `src/features/repositories-universal/services/insurers.service.ts`
- [x] 7.3 Create `src/features/repositories-universal/hooks/useInsurers.ts`
- [x] 7.4 Create `src/features/repositories-universal/components/insurers/InsurerFormModal.tsx` (name, emergencyPhone, website inputs)
- [x] 7.5 Create `src/features/repositories-universal/components/insurers/InsurerList.tsx` (table: Nombre, Teléfono de emergencia, Sitio web as clickable link, Estado, actions; search + status filter; skeleton; empty state)
- [x] 7.6 Create `src/features/repositories-universal/pages/InsurerListPage.tsx`

## 8. Pharmacies catalog

- [x] 8.1 Create `src/features/repositories-universal/schemas/pharmacy.schema.ts` — Zod schema for `name` (required), `address` (optional), `phone` (optional)
- [x] 8.2 Create `src/features/repositories-universal/services/pharmacies.service.ts`
- [x] 8.3 Create `src/features/repositories-universal/hooks/usePharmacies.ts`
- [x] 8.4 Create `src/features/repositories-universal/components/pharmacies/PharmacyFormModal.tsx`
- [x] 8.5 Create `src/features/repositories-universal/components/pharmacies/PharmacyList.tsx` (table: Nombre, Dirección, Teléfono, Estado, actions; search + status filter; skeleton; empty state)
- [x] 8.6 Create `src/features/repositories-universal/pages/PharmacyListPage.tsx`

## 9. Routing integration

- [x] 9.1 In `src/router/index.tsx`, lazy-import the five new list pages
- [x] 9.2 Replace the five `placeholder(...)` elements under `/superadmin` (`doctors`, `specialties`, `medical-centers`, `insurers`, `pharmacies`) with the real page elements

## 10. Verification

- [x] 10.1 Run `npx tsc --noEmit` from `Med-care/` — 0 errors
- [x] 10.2 Manually test each of the 5 catalogs: list loads from seed, create, edit, deactivate (with confirm), reactivate, search, status filter — per the proposal's suggested visual test flow
- [x] 10.3 Confirm Dr. Torres and Dra. Vega show the "Propagado" badge and the other seed doctors show "SuperAdmin"
