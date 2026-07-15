# state-management Specification

## Purpose
TBD - created by archiving change scaffolding-base. Update Purpose after archive.

## Requirements
### Requirement: Auth store manages authentication state and persists session
`src/stores/auth.store.ts` SHALL expose a Zustand store with: `user` (typed as `User | null`), `isAuthenticated` (boolean), `login(user: User)`, `logout()`, `updatePassword(newPassword: string)`. The session MUST be persisted in `localStorage` under the key defined in `APP_CONFIG.session.storageKey`. On store initialization, the persisted session SHALL be rehydrated automatically.

#### Scenario: Login sets authenticated state
- **WHEN** `login(user)` is called with a valid User object
- **THEN** `isAuthenticated` becomes `true` and `user` is set to the provided value

#### Scenario: Logout clears authenticated state
- **WHEN** `logout()` is called
- **THEN** `isAuthenticated` becomes `false`, `user` becomes `null`, and the persisted session is cleared from localStorage

#### Scenario: Session is rehydrated on page refresh
- **WHEN** the user refreshes the page after a successful login
- **THEN** `isAuthenticated` is `true` and `user` contains the previously stored User object

### Requirement: Theme store manages and persists the active theme
`src/stores/theme.store.ts` SHALL expose a Zustand store with: `theme` (`'light' | 'dark'`), `setTheme(theme)`, `toggleTheme()`. The theme MUST be persisted in `localStorage` under `APP_CONFIG.session.themeKey`. On initialization, if no stored value exists, the theme SHALL be inferred from `window.matchMedia('(prefers-color-scheme: dark)')`. Every time the theme changes, the store MUST apply or remove the class `.dark` on `document.documentElement`.

#### Scenario: Theme initializes from system preference
- **WHEN** no theme is stored in localStorage and the OS is in dark mode
- **THEN** `theme` is initialized to `'dark'` and `.dark` is applied to `document.documentElement`

#### Scenario: setTheme applies dark mode class
- **WHEN** `setTheme('dark')` is called
- **THEN** `document.documentElement.classList` contains `'dark'` and `theme` equals `'dark'`

#### Scenario: setTheme removes dark mode class
- **WHEN** `setTheme('light')` is called
- **THEN** `document.documentElement.classList` does NOT contain `'dark'` and `theme` equals `'light'`

#### Scenario: toggleTheme switches between light and dark
- **WHEN** `toggleTheme()` is called while `theme` is `'light'`
- **THEN** `theme` becomes `'dark'` and `.dark` is applied to `document.documentElement`

#### Scenario: Theme persists across page refresh
- **WHEN** the user sets theme to `'dark'` and then refreshes the page
- **THEN** `theme` is still `'dark'` and `.dark` is on `document.documentElement`

### Requirement: Group store manages current group context
`src/stores/group.store.ts` SHALL expose a Zustand store with: `currentGroup` (typed as `Group | null`), `members` (array of `User | NonAccountMember`), `setGroup(group, members)`, `clearGroup()`. No persistence is required — group context is re-fetched on login.

#### Scenario: setGroup populates group context
- **WHEN** `setGroup(group, members)` is called
- **THEN** `currentGroup` equals the provided group and `members` equals the provided array

#### Scenario: clearGroup resets group context
- **WHEN** `clearGroup()` is called
- **THEN** `currentGroup` is `null` and `members` is an empty array

### Requirement: No useEffect is used to derive state in stores
Store logic SHALL NOT use `useEffect` to synchronize or compute derived state. All derived values MUST be computed synchronously within store actions or as computed getters.

#### Scenario: Store action derives state synchronously
- **WHEN** a store action is called
- **THEN** all state updates occur synchronously within the action, without scheduling side effects via useEffect
