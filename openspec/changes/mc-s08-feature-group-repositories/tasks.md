## 1. Service layer

- [x] 1.1 Create `src/features/repositories-group/services/group-repositories.service.ts` with the `GroupRepoEntityType` union (`'doctor' | 'medicalCenter' | 'pharmacy' | 'insurer'`)
- [x] 1.2 Implement `getGroupRepository(groupId, entityType)` — active group rows joined in-memory against the corresponding universal catalog
- [x] 1.3 Implement `getImportCandidates(groupId, entityType)` — active universal records not already active in this group's repository
- [x] 1.4 Implement `importToGroupRepository({ groupId, entityType, entityId })` — reactivate an existing inactive row instead of inserting a duplicate
- [x] 1.5 Implement `checkDuplicateByName(entityType, name)` — case-insensitive search against the full universal catalog
- [x] 1.6 Implement `createGroupOwnEntry({ groupId, entityType, data })` — create the universal record with `originGroupId: groupId`, then the group repository row pointing to it
- [x] 1.7 Implement `deactivateGroupRepositoryEntry({ groupId, entityType, entryId })` — flips `isActive` on the group row only, never touches the universal record
- [x] 1.8 Verify no component or hook outside this service file imports from `src/mock/` for group repository data (R3/ADR-006)

## 2. Hooks

- [x] 2.1 Create `useGroupRepository.ts` — `useQuery(['groupRepository', groupId, entityType])`
- [x] 2.2 Create `useImportCandidates.ts` — `useQuery(['importCandidates', groupId, entityType])`
- [x] 2.3 Create `useImportToGroupRepository.ts` — invalidates `['groupRepository', groupId, entityType]` and `['importCandidates', groupId, entityType]`
- [x] 2.4 Create `useCheckDuplicateByName.ts` — on-demand query/mutation, no automatic fetch on mount
- [x] 2.5 Create `useCreateGroupOwnEntry.ts` — invalidates `['groupRepository', groupId, entityType]`, `['importCandidates', groupId, entityType]`, and `['universalCatalog', entityType]` if that key exists from `repositories-universal`
- [x] 2.6 Create `useDeactivateGroupRepositoryEntry.ts` — invalidates `['groupRepository', groupId, entityType]`

## 3. Schemas

- [x] 3.1 Add `z.object({ selectedIds: z.array(z.string()).min(1) })` schema for `ImportEntityModal` selection
- [x] 3.2 Confirm `CreateOwnEntryModal` reuses `doctorSchema`/`medicalCenterSchema`/`pharmacySchema`/`insurerSchema` from `repositories-universal` without duplicating validation

## 4. Components — group repositories page

- [x] 4.1 Create `GroupRepositoriesPage.tsx` at `/admin/repositories` with tabs for Médicos / Centros médicos / Farmacias / Aseguradoras, scoped to the group currently in focus
- [x] 4.2 Create `GroupRepositoryTab.tsx` — table (name, specialty column for doctors only, status, actions) + header actions "Importar existente" / "Crear nuevo", parameterized by `entityType`
- [x] 4.3 Create `ImportEntityModal.tsx` — Command+Popover multi-select over `getImportCandidates`, client-side name search
- [x] 4.4 Create `CreateOwnEntryModal.tsx` — renders the matching existing form (`DoctorForm`/`MedicalCenterForm`/`PharmacyForm`/`InsurerForm`), calls `checkDuplicateByName` on submit before saving
- [x] 4.5 Create `DuplicateFoundDialog.tsx` — exact REP-GRP-HU-02 copy adapted per entity type, with "Usar existente" / "Crear nuevo de todos modos" actions
- [x] 4.6 Wire "Desactivar" action on `GroupRepositoryTab` rows through the shared `ConfirmModal`
- [x] 4.7 Add route `/admin/repositories` restricted to role `admin`

## 5. Onboarding integration

- [x] 5.1 Replace the doctors onboarding step's "Omitir por ahora"-only placeholder with real import/create functionality (reusing `ImportEntityModal` + `CreateOwnEntryModal` inline), keeping skip available
- [x] 5.2 Replace the centers/pharmacies onboarding step's placeholder the same way, covering both medical centers and pharmacies
- [x] 5.3 Remove the "Podrás agregar tus médicos aquí muy pronto..." placeholder copy from the onboarding steps

## 6. i18n

- [x] 6.1 Add all new `repositories.*` copy (tabs, modal titles/buttons, duplicate-dialog text, empty states) to `en.json`
- [x] 6.2 Add the matching Spanish strings to `es.json`, including the exact REP-GRP-HU-02 duplicate-dialog wording

## 7. Verification

- [x] 7.1 Manually verify Flujo 1 (import), Flujo 2 (create + duplicate detection), and Flujo 3 (deactivate) end to end for each of the four entity types
- [x] 7.2 Verify ADR-014 isolation: switching the group in focus shows a different, independent repository with no cross-group leakage
- [x] 7.3 Verify dark mode on `ImportEntityModal`, `CreateOwnEntryModal`, and `DuplicateFoundDialog`
- [x] 7.4 Run ESLint + Prettier and fix any violations
- [x] 7.5 Confirm no `GroupSpecialty` entity, tab, or service function was introduced
