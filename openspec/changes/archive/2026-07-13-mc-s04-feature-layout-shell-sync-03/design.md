## Context

`Sidebar.tsx` usa la clase Tailwind `bg-surface-dark`, que resuelve a la variable
CSS `--color-surface-dark`. Esa variable **cambia de valor según el tema**:
`#e8eaed` (gris claro) en `:root`, `#252d3d` (azul oscuro) en `.dark`. El diseño
visual del Sidebar siempre fue "panel oscuro fijo", pero el token que consume es
theme-reactive — el bug solo es visible en light mode porque en dark mode el valor
theme-reactive coincide por casualidad con un tono oscuro.

El proyecto usa Tailwind con `darkMode: ['class', '[data-theme="dark"]']`
(`tailwind.config.js:30`) pero el bloque real que redefine tokens en
`globals.css` es el selector de clase `.dark` (línea 74), no un atributo
`data-theme`. Cualquier fix debe apuntar a `.dark`, no a `[data-theme='dark']`.

## Goals / Non-Goals

**Goals:**
- El Sidebar se ve idéntico (fondo oscuro `#181d26`, texto blanco) en light y dark mode.
- Los nuevos tokens quedan declarados como clases Tailwind con nombre semántico, no como `bg-[#hex]` ni `bg-[--var]` arbitrario, para respetar la convención "sin hex en componentes" ya usada en el resto del design system.
- Cambio aislado a Sidebar/SidebarNavItem — no afecta TopBar ni el resto del layout.

**Non-Goals:**
- No se rediseña la paleta de colores general ni el toggle de tema (cubierto por `mc-s04-feature-layout-shell-sync-02`).
- No se resuelve aquí ningún otro uso de `bg-surface-dark` fuera de Sidebar/SidebarNavItem (no hay otros usos actualmente).

## Decisions

**Nuevas variables CSS fijas, declaradas solo en `:root`:**
```css
--color-sidebar-bg: #181d26;
--color-sidebar-text: #ffffff;
--color-sidebar-item-active: rgba(255, 255, 255, 0.10);
--color-sidebar-item-hover: rgba(255, 255, 255, 0.05);
```
Estas 4 variables **no se redefinen** en el bloque `.dark` de `globals.css` —
su valor es intencionalmente idéntico en ambos temas.

**Alias Tailwind en `tailwind.config.js` (`theme.extend.colors`):**
```js
sidebar: {
  DEFAULT: 'var(--color-sidebar-bg)',
  foreground: 'var(--color-sidebar-text)',
  active: 'var(--color-sidebar-item-active)',
  hover: 'var(--color-sidebar-item-hover)',
}
```
Esto habilita clases `bg-sidebar`, `text-sidebar-foreground`, `bg-sidebar-active`,
`hover:bg-sidebar-hover` — consistente con el patrón ya usado para `primary`,
`info`, `success` en el mismo archivo.

| Opción | Problema |
|---|---|
| `bg-[#181d26]` hardcodeado en el componente | Viola la convención existente de no usar hex en `.tsx` |
| `bg-[--color-surface-dark]` (dejar como está) | Token theme-reactive — es la causa raíz del bug |
| `bg-sidebar` vía alias Tailwind (elegido) | Semántico, fijo, consistente con el resto de `tailwind.config.js`, sin hex en componentes |

## Risks / Trade-offs

- [Riesgo] Otro componente futuro reutiliza `bg-surface-dark` asumiendo que es "oscuro fijo" y hereda el mismo bug → Mitigación: el nombre `sidebar` en el alias Tailwind comunica explícitamente que es de uso exclusivo del Sidebar, no un token general de superficie.
- [Riesgo] Cambiar `SidebarNavItem.tsx` toca el estado `isActive`/hover que ya funciona en dark mode → Mitigación: los valores hex/rgba fijos son idénticos a los que ya se veían en dark mode (`#181d26`, `white/10`, `white/5`), por lo que dark mode no cambia visualmente; solo light mode se corrige.

## Migration Plan

Cambio puramente de CSS/clases, sin migración de datos. Se aplica y verifica
visualmente en ambos temas; si algo se ve mal se revierte el commit sin efectos
secundarios en otros módulos.
