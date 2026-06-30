## ADDED Requirements

### Requirement: i18next is configured with ES as default language and EN as fallback
`src/i18n/index.ts` SHALL initialize i18next with `react-i18next`. The default language MUST be `'es'`. The fallback language MUST be `'en'`. The configuration MUST import translation resources from `src/i18n/locales/es.json` and `src/i18n/locales/en.json` and register them as the `translation` namespace.

#### Scenario: App loads with Spanish as default language
- **WHEN** the app starts without any stored language preference
- **THEN** `i18next.language` equals `'es'` and translations resolve from the Spanish resource

#### Scenario: Missing key falls back to English
- **WHEN** a translation key exists in `en.json` but not in `es.json`
- **THEN** i18next returns the English value instead of the key string

### Requirement: Translation files have namespace structure for all features
`src/i18n/locales/es.json` and `src/i18n/locales/en.json` SHALL contain a structured object with top-level keys for each feature namespace: `auth`, `common`, `users`, `groups`, `appointments`, `exams`, `notes`, `dashboard`, `repositories`, `settings`. Each namespace key MAY be an empty object `{}` at scaffolding time — keys will be populated as features are built.

#### Scenario: All namespaces exist in both locale files
- **WHEN** the translation files are loaded
- **THEN** both `es.json` and `en.json` contain the keys `auth`, `common`, `users`, `groups`, `appointments`, `exams`, `notes`, `dashboard`, `repositories`, `settings`

### Requirement: i18n is initialized before React renders
The i18n initialization MUST be imported (not called lazily) in `src/main.tsx` so that the `t()` function is ready before any component renders.

#### Scenario: t() is available on first render
- **WHEN** a component uses `const { t } = useTranslation()` on its first render
- **THEN** `t('common.loading')` returns the Spanish translation string, not the key

### Requirement: No hardcoded strings appear in component files
Component files SHALL use `t('namespace.key')` for every user-visible string. No string literal for UI text SHALL appear directly in JSX or component return values.

#### Scenario: Component displays translated text
- **WHEN** a component renders a button label
- **THEN** the label is rendered via `t('common.save')`, not as a literal `'Guardar'` or `'Save'`
