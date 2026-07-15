## 1. Tokens CSS fijos

- [x] 1.1 Agregar `--color-sidebar-bg`, `--color-sidebar-text`, `--color-sidebar-item-active`, `--color-sidebar-item-hover` en el bloque `:root` de `src/styles/globals.css`, junto a las variables de layout existentes
- [x] 1.2 Confirmar que esas 4 variables NO están declaradas ni redefinidas en el bloque `.dark` de `globals.css`

## 2. Alias Tailwind

- [x] 2.1 Agregar el grupo `sidebar` (`DEFAULT`, `foreground`, `active`, `hover`) en `theme.extend.colors` de `tailwind.config.js`, apuntando a las 4 variables nuevas

## 3. Componentes

- [x] 3.1 En `Sidebar.tsx`, reemplazar `bg-surface-dark` por `bg-sidebar` en el `<aside>`
- [x] 3.2 En `Sidebar.tsx`, reemplazar los `text-white` hardcodeados (badge "MFC" y nombre de la app) por `text-sidebar-foreground`
- [x] 3.3 En `SidebarNavItem.tsx`, reemplazar `text-white/80` y `hover:bg-white/5` por `text-sidebar-foreground/80` y `hover:bg-sidebar-hover`
- [x] 3.4 En `SidebarNavItem.tsx`, reemplazar `bg-primary-active text-white` del estado `isActive` por `bg-sidebar-active text-sidebar-foreground`

## 4. Verificación

- [x] 4.1 Probar visualmente en light mode — sidebar con fondo `#181d26` y texto blanco legible
- [x] 4.2 Probar visualmente en dark mode — sin cambios respecto al estado actual (mismo fondo oscuro)
- [x] 4.3 Alternar el tema y confirmar que el Sidebar permanece visualmente estático
- [x] 4.4 Confirmar ítem activo (borde izquierdo + `bg-sidebar-active`) y hover (`bg-sidebar-hover`) legibles en ambos temas
- [x] 4.5 `npx tsc --noEmit` → 0 errores
