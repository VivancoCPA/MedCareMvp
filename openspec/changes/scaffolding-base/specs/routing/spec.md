## ADDED Requirements

### Requirement: Route tree covers all three role areas
`src/router/index.tsx` SHALL define a complete route tree using React Router v6's `createBrowserRouter`. The tree MUST include: public routes (`/login`, `/login/change-password`, `/login/forgot-password`), the root route `/` with automatic redirect based on authenticated user's role, and three private role areas: `/superadmin/*`, `/admin/*`, `/member/*`. Pages that do not yet have feature implementations MUST be represented as inline placeholder components that display the route name.

#### Scenario: Root route redirects authenticated superadmin
- **WHEN** an authenticated user with role `superadmin` navigates to `/`
- **THEN** they are redirected to `/superadmin/users`

#### Scenario: Root route redirects authenticated admin
- **WHEN** an authenticated user with role `admin` navigates to `/`
- **THEN** they are redirected to `/admin/dashboard`

#### Scenario: Root route redirects authenticated member
- **WHEN** an authenticated user with role `member` navigates to `/`
- **THEN** they are redirected to `/member/dashboard`

#### Scenario: Root route redirects unauthenticated user
- **WHEN** an unauthenticated user navigates to `/`
- **THEN** they are redirected to `/login`

### Requirement: Superadmin area routes are defined
The `/superadmin` area SHALL contain routes for: `users`, `doctors`, `specialties`, `medical-centers`, `insurers`, `pharmacies`. Each route MUST be protected by `ProtectedRoute` and `RoleGuard` restricting access to users with role `superadmin`.

#### Scenario: Superadmin accesses their area
- **WHEN** a user with role `superadmin` navigates to `/superadmin/users`
- **THEN** the placeholder or real page renders without redirect

#### Scenario: Non-superadmin is redirected from superadmin area
- **WHEN** a user with role `admin` navigates to `/superadmin/users`
- **THEN** `RoleGuard` redirects them to `/admin/dashboard`

### Requirement: Admin area routes are defined
The `/admin` area SHALL contain routes for: `dashboard`, `group`, `group/onboarding`, `members/:id` (with nested sub-routes for health-profile, appointments, exams, notes), `repositories`, `settings`. Each route MUST be protected by `ProtectedRoute` and `RoleGuard` restricting access to users with role `admin`.

#### Scenario: Admin accesses group management
- **WHEN** a user with role `admin` navigates to `/admin/group`
- **THEN** the placeholder or real page renders without redirect

### Requirement: Member area routes are defined
The `/member` area SHALL contain routes for: `dashboard`, `profile`, `appointments` (with `new` and `:id` sub-routes), `exams` (with `new` and `:id` sub-routes), `notes`, `settings`. Each route MUST be protected by `ProtectedRoute` and `RoleGuard` restricting access to users with role `member`.

#### Scenario: Member accesses their dashboard
- **WHEN** a user with role `member` navigates to `/member/dashboard`
- **THEN** the placeholder or real page renders without redirect

### Requirement: ProtectedRoute redirects unauthenticated users
`src/router/ProtectedRoute.tsx` SHALL read `isAuthenticated` from the auth store and redirect to `/login` if false. It MUST not use `useEffect` for this check — the redirect MUST be synchronous during render.

#### Scenario: Unauthenticated user accesses protected route
- **WHEN** an unauthenticated user navigates to `/admin/dashboard`
- **THEN** they are immediately redirected to `/login`

#### Scenario: Authenticated user passes protected route
- **WHEN** an authenticated user navigates to a protected route matching their role
- **THEN** the route renders the target page without redirect

### Requirement: RoleGuard enforces role-based route access
`src/router/RoleGuard.tsx` SHALL accept an `allowedRoles` prop and redirect users with a non-matching role to their own dashboard. The redirect destination MUST be derived from the user's role in the auth store.

#### Scenario: Wrong role is redirected to own dashboard
- **WHEN** a user with role `member` tries to access an admin route
- **THEN** `RoleGuard` redirects them to `/member/dashboard`
