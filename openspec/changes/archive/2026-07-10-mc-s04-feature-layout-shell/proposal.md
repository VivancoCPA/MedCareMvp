## Why

Las tres áreas protegidas (`/superadmin`, `/admin`, `/member`) hoy renderizan páginas placeholder directamente bajo `RoleGuard`, sin ningún shell visual. No existe navegación, ni identidad contextual de usuario, ni logout accesible desde la UI. Todos los módulos de features posteriores (05, 06, 07…) necesitan un shell de aplicación funcional para poder montarse — este change lo entrega junto con los dos componentes compartidos (`PageWrapper`, `EmptyState`) que esos módulos también requieren.

## What Changes

- **Implementado** (stub existente `return null`): `Shell.tsx` — shell raíz que conecta `Sidebar` + `TopBar` + `<Outlet />`, recibe `role: UserRole`. Se usa el nombre `Shell` (ya documentado en `frontend-architecture.md` y ya presente como stub) en vez del `AppLayout` propuesto originalmente, para no duplicar el componente raíz del layout.
- **Implementado** (stub existente `return null`): `Sidebar.tsx` — navegación lateral diferenciada por rol, colapsable (240px expandido / 64px iconos / drawer mobile)
- **Nuevo**: `SidebarNavItem.tsx` — ítem individual de navegación (icono + label + estado activo vía `NavLink`)
- **Implementado** (stub existente `return null`): `TopBar.tsx` — texto contextual por rol + `DropdownMenu` con logout
- **Implementado** (stub existente pass-through): `PageWrapper.tsx` — padding responsive real (`p-4 md:p-6`, max-width 1280px centrado)
- **Implementado** (stub existente `return null`): `EmptyState.tsx` — icono + título + descripción + acción opcional
- **Nuevo**: `src/hooks/useSidebar.ts` — wrapper sobre `ui.store.ts`; auto-colapsa en tablet (768–1024px) y cierra el drawer al cambiar de ruta
- **Nuevo**: `src/stores/ui.store.ts` — estado global `sidebarOpen` / `sidebarCollapsed`, persistido en `localStorage` bajo `'med-care-ui'`
- **Modificado**: `src/router/index.tsx` — inserta `<Shell role="..." />` como layout intermedio entre `RoleGuard` y las páginas placeholder de `/superadmin`, `/admin` y `/member`
- **Modificado**: `src/i18n/locales/es.json` y `en.json` — agrega claves `nav.*`, `layout.*`, `emptyState.*`
- **Modificado**: `src/styles/globals.css` — agrega `--sidebar-collapsed-width` y sincroniza las variables CSS que `tailwind.config.js` ya referencia (`bg-cream`, `border-hairline`, `text-muted`, `ring`, etc.) pero que hoy no existen en `globals.css` — mismo tipo de bug ya corregido una vez para los alias de Shadcn

## Capabilities

### New Capabilities

- `layout-shell`: Shell de aplicación (`Shell` + `Sidebar` + `TopBar`) con navegación diferenciada por rol, comportamiento responsive (expandido/colapsado/drawer), identidad contextual en el TopBar y logout
- `shared-page-components`: `PageWrapper` (padding responsive de contenido) y `EmptyState` (estado vacío reutilizable) — usados por todos los módulos de features posteriores

### Modified Capabilities

<!-- No hay specs existentes con requisitos de comportamiento a modificar — Shell/Sidebar/TopBar/PageWrapper/EmptyState existen hoy solo como stubs sin lógica -->

## Impact

- **Router**: las 3 ramas protegidas ganan un nivel de layout real; las rutas hijas (placeholders `div` con texto) no cambian
- **`ui.store.ts` / `useSidebar.ts`**: nuevo estado global, sin impacto en stores existentes
- **`group.store.ts`**: no se modifica. Nada en el código hidrata `currentGroup` todavía (`setGroup` no se llama en ningún lado); el `TopBar` del rol `admin` mostrará el fallback `layout.noGroup` hasta que un change futuro de features de grupo implemente la carga
- **Logout**: no existe un hook `useLogout()` en `feature-auth` (solo `authStore.logout()` / `useAuth()`); el `TopBar` llama `logout()` del store directamente y navega a `/login`
- **`globals.css`**: se agregan variables CSS que `tailwind.config.js` ya espera desde el fix de alias de Shadcn pero que aún no están declaradas — sin este fix, clases como `bg-cream`, `border-hairline`, `text-muted` o `ring` no resuelven a ningún color. Se documentan los valores elegidos en `design.md`
- **Fuera de alcance**: `src/features/auth/components/AuthLayout.tsx` usa clases (`bg-surface`, `border-border`) que tampoco están en el mapa de colores actual de `tailwind.config.js` — es un problema preexistente de `feature-auth` (ya "implementado y verificado", fuera del alcance de este change) y no se corrige aquí
- **i18n**: ~25 claves nuevas bajo `nav.*`, `layout.*` y `emptyState.*` en ambos locales (`es.json`, `en.json`)
