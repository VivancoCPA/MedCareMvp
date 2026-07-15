# design-system Specification

## Purpose
TBD - created by archiving change scaffolding-base. Update Purpose after archive.

## Requirements
### Requirement: CSS custom properties define all design tokens
The file `src/styles/globals.css` SHALL define all color, typography, spacing, border-radius, and layout tokens as CSS custom properties on `:root`. Color tokens MUST include: `--color-ink`, `--color-canvas`, `--color-surface`, `--color-surface-dark`, `--color-primary`, `--color-on-primary`, `--color-border`, `--color-link`, `--color-destructive`, `--color-success`, `--color-warning`. Layout tokens MUST include: `--sidebar-width: 240px`, `--topbar-height: 64px`. No hex value SHALL appear directly in any component file.

#### Scenario: Light mode tokens are applied by default
- **WHEN** the app loads without a `.dark` class on the document element
- **THEN** `:root` CSS variables resolve to the light mode palette (`--color-canvas: #ffffff`, `--color-ink: #181d26`, etc.)

#### Scenario: Dark mode tokens override light mode
- **WHEN** the `.dark` class is present on `document.documentElement`
- **THEN** CSS custom properties resolve to dark mode values (canvas and ink values are inverted)

### Requirement: Tailwind config maps tokens to utility classes
`tailwind.config.js` SHALL extend the Tailwind theme to map the CSS custom properties to named utility classes. The mapping MUST allow classes like `bg-canvas`, `text-ink`, `border-border`, `bg-primary`, `text-on-primary`, `text-destructive`, `text-success`, `text-link`. Colors SHALL reference CSS variables via `var(--color-<name>)` so that dark mode toggling takes effect automatically.

#### Scenario: Token classes resolve to CSS variable values
- **WHEN** a component uses the class `bg-canvas`
- **THEN** the element's background color equals the current value of `--color-canvas`

#### Scenario: Dark mode utility class switches token values
- **WHEN** `.dark` is added to `documentElement` and a component has class `bg-canvas`
- **THEN** the background color switches to the dark mode value of `--color-canvas` without any class change on the component

### Requirement: Styles entry point is imported in main.tsx
The file `src/styles/globals.css` SHALL be imported in `src/main.tsx` as the styles entry point so that CSS custom properties and Tailwind base styles are available globally.

#### Scenario: Global styles load on app start
- **WHEN** the application starts
- **THEN** CSS custom properties are available on `:root` and Tailwind utility classes resolve correctly

### Requirement: No hex values appear directly in component files
Component, hook, store, and utility files SHALL NOT contain hardcoded hex color values. Colors MUST be referenced via Tailwind utility classes (which map to CSS variables) or CSS variable references (`var(--color-<name>)`).

#### Scenario: Component uses token class instead of inline hex
- **WHEN** a component needs to display a destructive (red) color
- **THEN** it uses the class `text-destructive` or `text-[color:var(--color-destructive)]`, never `text-[#dc2626]` or `style={{ color: '#dc2626' }}`
