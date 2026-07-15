# http-client Specification

## Purpose
TBD - created by archiving change scaffolding-base. Update Purpose after archive.

## Requirements
### Requirement: Axios instance is pre-configured with API base URL and auth token interceptor
`src/lib/axios.ts` SHALL export a default Axios instance with `baseURL` set to `APP_CONFIG.api.baseUrl`. A request interceptor MUST read the current session from localStorage (under `APP_CONFIG.session.storageKey`) and attach the token as `Authorization: Bearer <token>` header if present.

#### Scenario: Authenticated request includes Bearer token
- **WHEN** an authenticated session exists in localStorage and an API request is made
- **THEN** the outgoing request includes the header `Authorization: Bearer <token>`

#### Scenario: Unauthenticated request has no Authorization header
- **WHEN** no session exists in localStorage and an API request is made
- **THEN** the outgoing request does NOT include an `Authorization` header

### Requirement: 401 response triggers automatic logout
The Axios response interceptor SHALL detect HTTP 401 responses and call `useAuthStore.getState().logout()` to clear the session. The interceptor MUST access the store imperatively (without a React hook) so it works outside component lifecycle.

#### Scenario: 401 response logs out the user
- **WHEN** any API request receives a 401 response
- **THEN** `authStore.logout()` is called, `isAuthenticated` becomes `false`, and the user is effectively logged out

#### Scenario: Non-401 error is not intercepted
- **WHEN** an API request receives a 404 or 500 response
- **THEN** the error is rejected normally without triggering logout

### Requirement: QueryClient is configured with 5-minute staleTime
`src/lib/queryClient.ts` SHALL export a `QueryClient` instance with `defaultOptions.queries.staleTime` set to 5 minutes (300,000 ms). This prevents unnecessary refetches on component re-mount within the same session.

#### Scenario: Query data is not refetched within 5 minutes
- **WHEN** a query fetches data and the component re-mounts within 5 minutes
- **THEN** TanStack Query uses the cached data without making a new network request

### Requirement: QueryClientProvider and i18n init are mounted in main.tsx
`src/main.tsx` SHALL wrap the app with `QueryClientProvider` using the exported `queryClient` instance. It MUST also import the i18n initialization module. The theme store SHALL be read at startup to apply the `.dark` class to `document.documentElement` before the first render if the stored theme is `'dark'`.

#### Scenario: App mounts with correct initial theme class
- **WHEN** the app loads and the stored theme is `'dark'`
- **THEN** `document.documentElement` has the class `'dark'` before the first React render cycle completes
