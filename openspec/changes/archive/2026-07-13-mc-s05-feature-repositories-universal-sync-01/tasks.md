## 1. Foundations (types, config, helpers)

- [x] 1.1 Add `avatarUrl: string | null` to `Doctor` and `logoUrl: string | null` to `Insurer` in `src/types/index.ts`
- [x] 1.2 Add `getInitials(name: string): string` to `src/lib/utils.ts` next to `cn()`
- [x] 1.3 Bump `APP_CONFIG.mock.simulatedDelayMs` 300 → 400 and `APP_CONFIG.pagination.defaultPageSize` 20 → 10 in `src/config/app.config.ts`
- [x] 1.4 Create `src/hooks/usePagination.ts` (page, setPage, totalPages, paginated; `useEffect` resets to page 1 on `items.length` change; default page size from `APP_CONFIG.pagination.defaultPageSize`)
- [x] 1.5 Add `src/components/ui/pagination.tsx` (Shadcn pagination primitive — new file, no existing `ui/*` file modified, per ADR-001/013)

## 2. Sidebar manual collapse (desktop)

- [x] 2.1 In `src/hooks/useSidebar.ts`, read `sidebarCollapsed` and the toggle action from `useUiStore`, and change `collapsed` to `tier === 'tablet' || (tier === 'desktop' && sidebarCollapsed)`; return `tier` and the toggle function
- [x] 2.2 In `src/components/layout/Sidebar.tsx`, add a footer button (before the closing `<aside>`) that calls the toggle from `useSidebar()`, rendered only when `tier === 'desktop'`; use `PanelLeftClose`/`PanelLeftOpen` from `lucide-react`, label hidden when collapsed
- [x] 2.3 Add `layout.collapseSidebar` / `layout.expandSidebar` keys to `src/i18n/locales/en.json` and `es.json`

## 3. Standardized row height (all 5 catalogs)

- [x] 3.1 Apply `h-12` on `TableRow` and `py-0` on `TableCell` in `DoctorList.tsx`, `SpecialtyList.tsx`, `MedicalCenterList.tsx`, `InsurerList.tsx`, `PharmacyList.tsx`
- [x] 3.2 Add a one-line comment on the first `TableRow` of each file documenting `h-12` as the app-wide row-height standard

## 4. Reactivate confirmation (all 5 catalogs)

- [x] 4.1 Add `repositories.common.confirmReactivateTitle` and a per-entity `confirmReactivateMessage` key (doctors, specialties, medicalCenters, insurers, pharmacies) to `en.json` and `es.json`
- [x] 4.2 In each `*List.tsx`, change the `onReactivate` row action to call the prop as-is (no behavior change needed at this layer — confirm state lives in the page)
- [x] 4.3 In `DoctorListPage.tsx`, add `reactivateTarget`/`isReactivating` state and a second `ConfirmModal` mirroring the existing deactivate one; change `DoctorList`'s `onReactivate` prop from `(doctor) => reactivateDoctor(doctor.id)` to `setReactivateTarget`
- [x] 4.4 Repeat 4.3 for `SpecialtyListPage.tsx`, `MedicalCenterListPage.tsx`, `InsurerListPage.tsx`, `PharmacyListPage.tsx`

## 5. Legible status badge

- [x] 5.1 Update `src/components/shared/StatusBadge.tsx` to use explicit Tailwind classes (`bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400` for active; `bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400` for inactive) instead of the `--color-signature-mint`/`--color-signature-forest`/`--color-surface-strong`/`--color-muted` tokens
- [x] 5.2 Manually verify contrast in both light and dark theme via the theme toggle in `TopBar`

## 6. Doctor avatar

- [x] 6.1 Add a photo upload section to `DoctorFormModal.tsx`: circular 64px preview (image or initials via `getInitials`), `<input type="file" accept="image/jpeg,image/png,image/webp">` wired to `URL.createObjectURL` via `form.setValue('avatarUrl', ...)`, and a "Quitar foto" clear button
- [x] 6.2 Add an avatar column (first column, 32px circular, image-or-initials) to `DoctorList.tsx`
- [x] 6.3 Pass `avatarUrl` through the create/update DTO in `DoctorListPage.tsx`'s `handleFormSubmit`
- [x] 6.4 Add `repositories.doctors.fieldAvatar`, `avatarAlt`, `removeAvatar` keys to `en.json` and `es.json`

## 7. Insurer logo

- [x] 7.1 Add a logo upload section to `InsurerFormModal.tsx`: rounded-rect preview (64×48px, `object-contain`, image or initials via `getInitials`), same file-input/`URL.createObjectURL`/clear pattern as doctors
- [x] 7.2 Add a logo column (first column, 32×32px `object-contain`, image-or-initials) to `InsurerList.tsx`
- [x] 7.3 Pass `logoUrl` through the create/update DTO in `InsurerListPage.tsx`'s submit handler
- [x] 7.4 Add `repositories.insurers.fieldLogo`, `logoAlt`, `removeLogo` keys to `en.json` and `es.json`

## 8. Pagination (all 5 catalogs)

- [x] 8.1 Apply `usePagination` to the filtered result set in each of `DoctorList.tsx`, `SpecialtyList.tsx`, `MedicalCenterList.tsx`, `InsurerList.tsx`, `PharmacyList.tsx`, rendering `paginated` instead of the full filtered array
- [x] 8.2 Add the `Pagination` controls (from `src/components/ui/pagination.tsx`) below each table, hidden when `totalPages <= 1`

## 9. Seed data expansion

- [x] 9.1 Add missing specialty entries to `SEED_IDS.specialties` in `src/mock/seed/ids.ts` (e.g. `neurologia`, `ginecologia`, `oftalmologia`, `psiquiatria`) and corresponding records to `src/mock/seed/specialties.ts`, totaling ≥10 records, mixed `isActive`
- [x] 9.2 Add `SEED_IDS.doctors` entries and records to `src/mock/seed/doctors.ts` to reach ≥12 total, referencing the expanded specialty set, mixed `isActive`, `avatarUrl: null`
- [x] 9.3 Add `SEED_IDS.medicalCenters` entries and records to `src/mock/seed/medical-centers.ts` to reach ≥10 total, mixed `isActive`
- [x] 9.4 Add `SEED_IDS.insurers` entries and records to `src/mock/seed/insurers.ts` to reach ≥10 total, mixed `isActive`, `logoUrl: null`
- [x] 9.5 Add `SEED_IDS.pharmacies` entries and records to `src/mock/seed/pharmacies.ts` to reach ≥10 total, mixed `isActive`

## 10. Verification

- [x] 10.1 `npx tsc --noEmit` in `Med-care/` → 0 errors
- [x] 10.2 Manually verify: desktop sidebar collapse toggle persists across reload; tablet/mobile unaffected
- [x] 10.3 Manually verify: reactivate on each of the 5 catalogs opens `ConfirmModal` and only applies on confirm
- [x] 10.4 Manually verify: status badges legible in both light and dark theme
- [x] 10.5 Manually verify: doctor avatar and insurer logo — with image, without image (initials), in modal and in list
- [x] 10.6 Manually verify: pagination on each of the 5 catalogs, including reset to page 1 after changing search/status filter
