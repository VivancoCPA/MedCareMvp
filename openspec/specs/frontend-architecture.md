# Spec: Frontend Architecture — MedFamilyCare

## Stack

| Tool                    | Version | Role                                              |
| ----------------------- | ------- | ------------------------------------------------- |
| React                   | 19      | UI framework                                      |
| TypeScript              | 5.x     | Static typing                                     |
| Vite                    | 5.x     | Bundler & dev server                              |
| Tailwind CSS            | 3.x     | Utility styles                                    |
| Shadcn/ui               | latest  | Base UI components (copied to src/components/ui/) |
| Lucide React            | latest  | Icons                                             |
| React Hook Form         | 7.x     | Form management                                   |
| Zod                     | 3.x     | Schema validation                                 |
| Zustand                 | 4.x     | Global state                                      |
| TanStack Query          | 5.x     | Server state & data fetching                      |
| Axios                   | 1.x     | HTTP client                                       |
| i18next + react-i18next | latest  | i18n                                              |
| React Router            | 6.x     | SPA routing                                       |

## Folder Structure

src/
├── assets/
├── components/
│ ├── ui/ # Shadcn/ui components — modifiable
│ ├── layout/ # Shell, Sidebar, TopBar, PageWrapper
│ └── shared/
│ ├── MemberAvatar.tsx
│ ├── AlertBadge.tsx
│ ├── StatusBadge.tsx
│ ├── EmptyState.tsx
│ ├── ConfirmModal.tsx
│ └── FileUploader.tsx
├── config/
│ └── app.config.ts
├── features/
│ ├── auth/
│ ├── users/
│ ├── groups/
│ ├── health-profile/
│ ├── appointments/
│ ├── consultation-results/
│ ├── auxiliary-exams/
│ ├── free-notes/
│ ├── dashboard/
│ ├── repositories-universal/
│ └── repositories-group/
├── hooks/
│ ├── useAuth.ts
│ ├── useCurrentGroup.ts
│ └── useToast.ts
├── i18n/
│ ├── index.ts
│ └── locales/
│ ├── es.json
│ └── en.json
├── lib/
│ ├── axios.ts
│ ├── queryClient.ts
│ └── utils.ts # cn(), formatDate(), formatDateTime(), validateFile()
├── mock/
│ ├── index.ts
│ └── seed/ # one file per entity
│ └── helpers/ # resolveMember, getActiveMedications, getUpcomingAppointments
├── router/
│ ├── index.tsx
│ ├── ProtectedRoute.tsx
│ └── RoleGuard.tsx
├── stores/
│ ├── auth.store.ts
│ ├── theme.store.ts
│ └── group.store.ts
├── styles/
│ ├── globals.css
│ └── tailwind.css
├── types/
│ └── index.ts # Re-exports all types from data-model spec
└── main.tsx

## Feature Internal Structure

Every feature follows this exact pattern:

features/[module]/
├── components/
├── hooks/ # useQuery / useMutation wrappers
├── schemas/ # Zod schemas for form validation
├── services/ # ONLY point that knows about mock vs API
└── index.ts # Named re-exports only

**Critical rule:** Components and hooks NEVER import from `src/mock/` directly.
Only `services/` files may import from `src/mock/`.

## app.config.ts

```typescript
export const APP_CONFIG = {
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5043/api/",
  },
  upload: {
    maxPdfSizeBytes: 3 * 1024 * 1024,
    maxImageSizeBytes: 4 * 1024 * 1024,
    allowedMimeTypes: ["application/pdf", "image/jpeg", "image/png"],
  },
  session: {
    storageKey: "mfc_session",
    themeKey: "mfc_theme",
  },
  mock: {
    enabled: import.meta.env.VITE_USE_MOCK === "true" || true,
    simulatedDelayMs: 400,
  },
  pagination: { defaultPageSize: 20 },
  dashboard: { upcomingAppointmentsDays: 30 },
} as const;
```

## Zustand Stores

### auth.store.ts

```typescript
interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updatePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<void>;
}
// Session persisted in localStorage under APP_CONFIG.session.storageKey
```

### theme.store.ts

```typescript
interface ThemeStore {
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  toggleTheme: () => void;
}
// Persisted in localStorage under APP_CONFIG.session.themeKey
// Initialized from prefers-color-scheme if no saved value
```

### group.store.ts

```typescript
interface GroupStore {
  currentGroup: Group | null;
  members: (User | NonAccountMember)[];
  setGroup: (group: Group) => void;
  clearGroup: () => void;
}
```

## Route Tree

/ → redirect by role
/login → LoginPage (public)
/login/change-password → ChangePasswordPage (public, first-login only)
/login/forgot-password → ForgotPasswordPage (public)
/superadmin → SuperAdmin layout (ProtectedRoute + RoleGuard)
/superadmin/users → UserListPage
/superadmin/users/new → UserFormPage
/superadmin/users/:id → UserFormPage (edit)
/superadmin/doctors → DoctorListPage
/superadmin/doctors/new → DoctorFormPage
/superadmin/doctors/:id → DoctorFormPage (edit)
/superadmin/specialties → SpecialtyListPage
/superadmin/medical-centers → MedicalCenterListPage
/superadmin/insurers → InsurerListPage
/superadmin/pharmacies → PharmacyListPage
/admin → Admin layout (ProtectedRoute + RoleGuard)
/admin/dashboard → AdminDashboardPage
/admin/group → GroupPage
/admin/group/onboarding → GroupOnboardingPage
/admin/group/members/new → AddMemberPage
/admin/members/:memberId → MemberHealthRecordPage
/admin/members/:memberId/profile → HealthProfilePage
/admin/members/:memberId/appointments → AppointmentListPage
/admin/members/:memberId/appointments/new → AppointmentFormPage
/admin/members/:memberId/appointments/:id → AppointmentDetailPage
/admin/members/:memberId/appointments/:id/result → ConsultationResultFormPage
/admin/members/:memberId/exams → AuxiliaryExamListPage
/admin/members/:memberId/exams/new → AuxiliaryExamFormPage
/admin/members/:memberId/exams/:id → AuxiliaryExamDetailPage
/admin/members/:memberId/notes → FreeNotesPage
/admin/repositories → GroupRepositoriesPage
/admin/settings → AccountSettingsPage
/member → Member layout (ProtectedRoute + RoleGuard)
/member/dashboard → MemberDashboardPage
/member/profile → HealthProfilePage
/member/appointments → AppointmentListPage
/member/appointments/new → AppointmentFormPage
/member/appointments/:id → AppointmentDetailPage
/member/appointments/:id/result → ConsultationResultFormPage
/member/exams → AuxiliaryExamListPage
/member/exams/new → AuxiliaryExamFormPage
/member/exams/:id → AuxiliaryExamDetailPage
/member/notes → FreeNotesPage
/member/settings → AccountSettingsPage

## Role → Initial Route

| Role       | Redirect after login |
| ---------- | -------------------- |
| superadmin | /superadmin/users    |
| admin      | /admin/dashboard     |
| member     | /member/dashboard    |

## Coding Conventions (non-negotiable)

- **NO `useEffect` to derive state** — use `useMemo` or TanStack Query
- **NO hardcoded strings** in components — always `t('key')`
- **NO imports from `src/mock/`** in components or hooks — only in services
- **NO hex values** directly in components — always CSS vars or Tailwind tokens
- **NO physical deletes** — always set `deletedAt`
- **NO assuming `memberId` is a User** — always check `memberType`
- **NO marketing components** (hero, landing, pricing) — this is a management app
- **NO date formatting in components** — always use `formatDate()` or `formatDateTime()`
- Named exports everywhere except page components and `main.tsx`
- Props typed with `interface`, never `type`
- Files: PascalCase for components, camelCase for hooks/services/schemas
- Mock delay: always apply `APP_CONFIG.mock.simulatedDelayMs`
