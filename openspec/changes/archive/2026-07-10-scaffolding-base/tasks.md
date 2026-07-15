## 1. Install Dependencies

- [x] 1.1 Install production dependencies: `npm install react-router-dom@6 @tanstack/react-query@5 axios@1 zustand@4 react-hook-form@7 zod@3 i18next react-i18next lucide-react clsx tailwind-merge`
- [x] 1.2 Install dev dependencies: `npm install -D tailwindcss@3 postcss autoprefixer @types/node`
- [x] 1.3 Verify all packages installed at correct major versions in `package.json`

## 2. Configure Tailwind CSS

- [x] 2.1 Run `npx tailwindcss init -p` in the project root to generate `tailwind.config.js` and `postcss.config.js`
- [x] 2.2 Update `tailwind.config.js` content paths to include `./index.html` and `./src/**/*.{ts,tsx}`
- [x] 2.3 Create `src/styles/globals.css` with CSS custom properties for all design tokens (colors light+dark, typography, spacing, radii, layout variables `--sidebar-width: 240px`, `--topbar-height: 64px`)
- [x] 2.4 Add `@layer base`, `@tailwind base`, `@tailwind components`, `@tailwind utilities` directives to `src/styles/globals.css`
- [x] 2.5 Add `.dark` class overrides in `globals.css` for dark mode color variables
- [x] 2.6 Extend `tailwind.config.js` theme to map `colors`, `borderRadius`, `fontFamily` to CSS variable references (e.g., `canvas: 'var(--color-canvas)'`, `ink: 'var(--color-ink)'`, `border: 'var(--color-border)'`)

## 3. Install and Configure Shadcn/ui

- [x] 3.1 Run `npx shadcn@latest init` with options: TypeScript=yes, style=default, baseColor=neutral, cssVariables=yes, import alias=`@/`
- [x] 3.2 Verify `components.json` was created and `@/components/ui/` path is configured
- [x] 3.3 Install Shadcn component: `button`
- [x] 3.4 Install Shadcn components: `input label select`
- [x] 3.5 Install Shadcn components: `dialog toast`
- [x] 3.6 Install Shadcn components: `table tabs`
- [x] 3.7 Install Shadcn components: `badge avatar card separator`
- [x] 3.8 Install Shadcn components: `dropdown-menu popover command form`
- [x] 3.9 Verify all Shadcn components render without TypeScript errors by checking imports resolve

## 4. Configure Path Aliases and Vite

- [x] 4.1 Update `tsconfig.json` to add `paths` mapping: `"@/*": ["./src/*"]`
- [x] 4.2 Update `vite.config.ts` to add `resolve.alias` for `@` pointing to `./src` using `path.resolve` and `fileURLToPath`
- [x] 4.3 Verify `import { cn } from '@/lib/utils'` resolves correctly (can be tested after creating utils.ts)

## 5. Generate Domain Types

- [x] 5.1 Create `src/types/index.ts` with all string union types: `UserRole`, `BloodType`, `Gender`, `MemberType`, `NonAccountMemberType`, `AppointmentStatus`, `ExamType`, `ExamStatus`, `MedicalCenterType`, `FileType`
- [x] 5.2 Add sub-interfaces to `src/types/index.ts`: `PermanentMedication`, `PrescribedMedication`, `ExamAttachment`
- [x] 5.3 Add core entity interfaces to `src/types/index.ts`: `User`, `Group`, `NonAccountMember`, `Specialty`, `Doctor`, `MedicalCenter`, `Insurer`, `Pharmacy`
- [x] 5.4 Add junction interfaces to `src/types/index.ts`: `GroupDoctor`, `GroupMedicalCenter`, `GroupInsurer`, `GroupPharmacy`
- [x] 5.5 Add health and activity interfaces to `src/types/index.ts`: `HealthProfile`, `Appointment`, `ConsultationResult`, `AuxiliaryExam`, `FreeNote`
- [x] 5.6 Verify `src/types/index.ts` compiles with zero TypeScript errors (`npx tsc --noEmit`)

## 6. Generate Config and Lib

- [x] 6.1 Create `src/config/app.config.ts` with the `APP_CONFIG` constant as specified (api, upload, session, mock, pagination, dashboard sections)
- [x] 6.2 Create `src/lib/utils.ts` with: `cn()` using clsx+tailwind-merge, `formatDate(iso)` returning DD/MM/YYYY in ES locale, `formatDateTime(iso)` returning date+time in ES locale, `validateFile(file)` checking MIME type and size against `APP_CONFIG.upload`
- [x] 6.3 Create `src/lib/queryClient.ts` exporting a `QueryClient` instance with `staleTime: 5 * 60 * 1000`
- [x] 6.4 Create `src/lib/axios.ts` with base Axios instance using `APP_CONFIG.api.baseUrl`, request interceptor for Bearer token from localStorage, and response interceptor calling `authStore.getState().logout()` on 401

## 7. Generate Zustand Stores

- [x] 7.1 Create `src/stores/auth.store.ts` with Zustand persist middleware: state (`user: User | null`, `isAuthenticated: boolean`), actions (`login`, `logout`, `updatePassword`), persisted to `APP_CONFIG.session.storageKey`
- [x] 7.2 Create `src/stores/theme.store.ts` with Zustand persist middleware: state (`theme: 'light' | 'dark'`), actions (`setTheme`, `toggleTheme`), each action applies/removes `.dark` on `document.documentElement`, initializes from `prefers-color-scheme` if no stored value
- [x] 7.3 Create `src/stores/group.store.ts` without persistence: state (`currentGroup: Group | null`, `members: Array<User | NonAccountMember>`), actions (`setGroup`, `clearGroup`)
- [x] 7.4 Verify all three stores compile with zero TypeScript errors

## 8. Configure i18n

- [x] 8.1 Create `src/i18n/locales/es.json` with top-level namespace keys: `auth`, `common`, `users`, `groups`, `appointments`, `exams`, `notes`, `dashboard`, `repositories`, `settings` — each as an empty object `{}`
- [x] 8.2 Create `src/i18n/locales/en.json` with identical structure to `es.json`
- [x] 8.3 Create `src/i18n/index.ts` initializing i18next with `react-i18next`, importing both locale files, setting `lng: 'es'`, `fallbackLng: 'en'`, `resources: { es: { translation: esJson }, en: { translation: enJson } }`

## 9. Build the Router

- [x] 9.1 Create `src/router/ProtectedRoute.tsx`: reads `isAuthenticated` from auth store, renders `<Outlet />` if authenticated, navigates to `/login` with `<Navigate>` if not — no useEffect
- [x] 9.2 Create `src/router/RoleGuard.tsx`: accepts `allowedRoles: UserRole[]` prop, reads `user.role` from auth store, renders `<Outlet />` if role matches, redirects to correct role dashboard if not
- [x] 9.3 Create `src/router/index.tsx` with `createBrowserRouter`: define public routes (`/login`, `/login/change-password`, `/login/forgot-password`) as inline placeholder components
- [x] 9.4 Add root route `/` with logic to redirect based on auth state and user role using `<Navigate>`
- [x] 9.5 Add `/superadmin` nested routes wrapped in `ProtectedRoute` + `RoleGuard(['superadmin'])`: `users`, `doctors`, `specialties`, `medical-centers`, `insurers`, `pharmacies` as placeholders
- [x] 9.6 Add `/admin` nested routes wrapped in `ProtectedRoute` + `RoleGuard(['admin'])`: `dashboard`, `group`, `group/onboarding`, `members/:id` (with nested `health-profile`, `appointments`, `exams`, `notes`), `repositories`, `settings` as placeholders
- [x] 9.7 Add `/member` nested routes wrapped in `ProtectedRoute` + `RoleGuard(['member'])`: `dashboard`, `profile`, `appointments` (with `new`, `:id`), `exams` (with `new`, `:id`), `notes`, `settings` as placeholders

## 10. Create Folder Structure and Placeholder Files

- [x] 10.1 Create feature directories: `src/features/auth/`, `users/`, `groups/`, `health-profile/`, `appointments/`, `consultation-results/`, `auxiliary-exams/`, `free-notes/`, `dashboard/`, `repositories-universal/`, `repositories-group/`
- [x] 10.2 Create `src/components/layout/` placeholder files: `Shell.tsx`, `Sidebar.tsx`, `TopBar.tsx`, `PageWrapper.tsx` — each exports a named component returning `null` or a minimal div
- [x] 10.3 Create `src/components/shared/` placeholder files: `MemberAvatar.tsx`, `AlertBadge.tsx`, `StatusBadge.tsx`, `EmptyState.tsx`, `ConfirmModal.tsx`, `FileUploader.tsx` — each exports a typed placeholder component
- [x] 10.4 Create `src/hooks/` placeholder files: `useAuth.ts`, `useCurrentGroup.ts`, `useToast.ts`
- [x] 10.5 Create `src/assets/` directory (can be empty)

## 11. Generate Mock Skeleton

- [x] 11.1 Create `src/mock/seed/users.ts` exporting `export const mockUsers: User[] = []`
- [x] 11.2 Create remaining seed files with typed empty arrays: `groups.ts`, `non-account-members.ts`, `health-profiles.ts`, `specialties.ts`, `doctors.ts`, `medical-centers.ts`, `insurers.ts`, `pharmacies.ts`, `group-repositories.ts`, `appointments.ts`, `consultation-results.ts`, `auxiliary-exams.ts`, `free-notes.ts`
- [x] 11.3 Create `src/mock/helpers/resolveMember.ts`: function that takes `(memberId: string, memberType: MemberType, users: User[], nonAccountMembers: NonAccountMember[])` and returns `User | NonAccountMember | undefined` — branches on `memberType`, never assumes account
- [x] 11.4 Create `src/mock/helpers/getActiveMedications.ts`: function that takes `(healthProfile: HealthProfile)` and returns `PermanentMedication[]` where `discontinuedAt === undefined`
- [x] 11.5 Create `src/mock/helpers/getUpcomingAppointments.ts`: function that takes `(appointments: Appointment[], withinDays?: number)` defaulting `withinDays` to `APP_CONFIG.dashboard.upcomingAppointmentsDays` and returns appointments with `scheduledAt` within the window from today
- [x] 11.6 Create `src/mock/index.ts` re-exporting all seed arrays and helpers as named exports

## 12. Update main.tsx

- [x] 12.1 Import `src/styles/globals.css` in `src/main.tsx` as the first import
- [x] 12.2 Import and call i18n initialization (`import '@/i18n'`) in `src/main.tsx`
- [x] 12.3 Read theme from store at startup and apply `.dark` class to `document.documentElement` before mounting React (call `useThemeStore.getState().setTheme(...)` or read and apply directly)
- [x] 12.4 Wrap the app with `QueryClientProvider` using the exported `queryClient`
- [x] 12.5 Mount the router with `RouterProvider` using the exported router from `src/router/index.tsx`
- [x] 12.6 Remove the default Vite+React boilerplate (`App.tsx`, `App.css`, default imports) that is no longer needed

## 13. Verify and Validate

- [x] 13.1 Run `npx tsc --noEmit` and resolve all TypeScript errors
- [x] 13.2 Run `npm run dev` and confirm the Vite server starts without compilation errors
- [x] 13.3 Navigate to `/login` in the browser and confirm the placeholder renders without a React error boundary
- [x] 13.4 Open browser DevTools → Elements and verify that the `<html>` element has no `.dark` class by default (light mode) or has it if OS prefers dark
- [x] 13.5 Confirm no hardcoded hex values exist in any generated file by running a search for `#[0-9a-fA-F]{3,6}` across `src/` excluding `globals.css`
- [x] 13.6 Confirm no hardcoded UI strings exist in component files by verifying all text is wrapped in `t()`
