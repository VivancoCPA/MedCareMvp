## Why

Un cliente reportó que no puede cambiar entre modo claro y oscuro: la infraestructura de theming (`theme.store.ts`, tokens `.dark` en `globals.css`, aplicación del tema antes del primer render en `main.tsx`) ya existe y funciona, pero no hay ningún control visible en la UI para invocarla. El único punto de entrada al layout autenticado es el `TopBar`, y hoy no expone el toggle.

## What Changes

- Agregar un botón de toggle de tema (iconos `Sun`/`Moon` de `lucide-react`) en el `TopBar`, conectado al `useThemeStore` ya existente (`toggleTheme`), ubicado entre el botón de menú/hamburger y el dropdown de usuario.
- El botón alterna accesiblemente vía `aria-label` traducido según el tema activo.
- Agregar las claves i18n `layout.switchToDark` / `layout.switchToLight` en `en.json` y `es.json`.

**No changes** a `theme.store.ts`, `main.tsx`, `globals.css` ni `tailwind.config.js` — la lógica de persistencia, la estrategia `.dark` class (ya soportada por `tailwind.config.js`: `darkMode: ['class', '[data-theme="dark"]']`) y los tokens de dark mode ya están completos e implementados; el único gap real es la ausencia de un control en la UI.

## Capabilities

### New Capabilities
(ninguna)

### Modified Capabilities
- `layout-shell`: nuevo requirement — el `TopBar` SHALL exponer un control de toggle de tema claro/oscuro accesible.

## Impact

- Archivos afectados: `src/components/layout/TopBar.tsx`, `src/i18n/locales/en.json`, `src/i18n/locales/es.json`.
- No se tocan `src/components/ui/` (ADR-001/ADR-013) ni `tailwind.config.js`.
- Sin cambios de API ni de dependencias (usa `lucide-react`, ya en uso).
