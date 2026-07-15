## Why

En light mode el `Sidebar` es ilegible: usa `bg-surface-dark`, un token que en `:root` vale `#e8eaed` (gris claro), combinado con texto e iconos hardcodeados en `text-white` / `text-white/80`. El resultado es texto blanco sobre fondo casi blanco. En dark mode funciona "por accidente" porque `--color-surface-dark` pasa a valer `#252d3d` (oscuro) en el bloque `.dark`. El Sidebar fue diseñado para verse siempre oscuro independientemente del tema activo, pero consume un token que sí cambia con el tema — hay que desacoplarlo.

## What Changes

- Agregar 4 variables CSS nuevas en `:root` de `globals.css`, fijas y **no redefinidas** en el bloque `.dark`: `--color-sidebar-bg`, `--color-sidebar-text`, `--color-sidebar-item-active`, `--color-sidebar-item-hover`.
- Registrar esos tokens en `tailwind.config.js` (bajo `theme.extend.colors`) para poder consumirlos como clases Tailwind (`bg-sidebar`, `text-sidebar`, etc.) en vez de arbitrary values con hex.
- Actualizar `Sidebar.tsx` para usar el fondo y texto fijos del sidebar en vez de `bg-surface-dark` y clases `text-white` hardcodeadas.
- Actualizar `SidebarNavItem.tsx` para usar los tokens fijos de hover/activo en vez de `text-white/80`, `hover:bg-white/5` y `bg-primary-active`.
- El Sidebar se ve idéntico (fondo oscuro, texto blanco) en light y dark mode; solo el área de contenido principal cambia con el toggle de tema.

## Capabilities

### New Capabilities

(ninguna)

### Modified Capabilities

- `layout-shell`: nuevo requirement — el `Sidebar` SHALL mantener colores fijos (fondo oscuro, texto claro) independientes del tema activo de la aplicación.

## Impact

- `Med-care/src/styles/globals.css` — nuevas variables CSS fijas en `:root`.
- `Med-care/tailwind.config.js` — nuevos alias de color para los tokens del sidebar.
- `Med-care/src/components/layout/Sidebar.tsx` — reemplazo de `bg-surface-dark` y `text-white` por tokens fijos.
- `Med-care/src/components/layout/SidebarNavItem.tsx` — reemplazo de `text-white/80`, `hover:bg-white/5`, `bg-primary-active` por tokens fijos.
- Sin cambios de API ni de datos; puramente visual/CSS.
