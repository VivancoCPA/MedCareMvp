## Context

`theme.store.ts` ya implementa un store Zustand con persistencia (`persist` middleware, clave `APP_CONFIG.session.themeKey`) y una función `applyTheme()` que agrega/remueve la clase `.dark` en `document.documentElement`. `main.tsx` ya aplica el tema guardado antes del primer render (previene FOUC). `globals.css` ya define un bloque `.dark { ... }` completo con todos los tokens de color. `tailwind.config.js` ya declara `darkMode: ['class', '[data-theme="dark"]']`, por lo que la estrategia de clase `.dark` funciona sin cambios.

Lo único que falta es un control en la UI que invoque `toggleTheme()`.

## Goals / Non-Goals

**Goals:**
- Exponer un botón accesible en el `TopBar` que alterne el tema usando el store existente.
- Reflejar el tema activo con iconografía (`Moon` en modo claro, `Sun` en modo oscuro).

**Non-Goals:**
- No se migra la estrategia de theming de clase `.dark` a atributo `data-theme` — ya funciona y migrarla sin necesidad introduce riesgo sin beneficio.
- No se modifican valores de tokens en `globals.css` (ya están completos).
- No se toca `src/components/ui/` (ADR-001/ADR-013).

## Decisions

- **Reusar `useThemeStore` tal cual**: el store ya expone `theme` y `toggleTheme`; el TopBar solo se suscribe, sin lógica nueva de estado.
- **Ubicación del botón**: entre el botón de menú/hamburger (visible en tablet/mobile) y el `DropdownMenu` de usuario, siguiendo el mismo patrón visual (`h-9 w-9`, `rounded-md`, hover con tokens) que el botón de menú existente en `TopBar.tsx`.
- **Iconos**: `Sun`/`Moon` de `lucide-react`, ya usado en el proyecto (`Menu` en el mismo archivo).

## Risks / Trade-offs

- [Riesgo] Ninguno significativo — cambio aditivo y aislado a un componente ya existente. → Mitigación: cubierto por el requirement/scenario nuevo en `layout-shell` y verificación manual en ambos temas.
