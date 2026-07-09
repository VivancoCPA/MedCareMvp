## 1. Tokens CSS

- [x] 1.1 En `src/styles/globals.css`, agregar a `:root`: `--color-body`, `--color-muted`, `--color-surface-soft`, `--color-surface-strong`, `--color-hairline`, `--color-border-strong`, `--color-success-border`, `--color-info`, `--color-info-border`, `--color-signature-cream`, `--color-signature-coral`, `--color-signature-mint`, `--color-signature-peach`, `--color-signature-forest`, `--radius-xs`, `--sidebar-collapsed-width` con los valores de la tabla en `design.md` (Decisión D3)
- [x] 1.2 Agregar los equivalentes en `.dark` para las variables de color de 1.1
- [x] 1.3 Verificar que `tailwind.config.js` no requiere ningún cambio (ya mapea estos nombres) — solo confirmar con `npx tsc --noEmit` y una revisión visual rápida de que `bg-cream`, `border-hairline`, `text-muted`, `ring` ya renderizan color

## 2. Store de UI y hook de sidebar

- [x] 2.1 Crear `src/stores/ui.store.ts`: Zustand + `persist` (`name: 'med-care-ui'`), estado `sidebarOpen: false`, `sidebarCollapsed: false`, acciones `setSidebarOpen`, `setSidebarCollapsed`, `toggleSidebar`
- [x] 2.2 Crear `src/hooks/useSidebar.ts`: `useSyncExternalStore` sobre `window.matchMedia` para derivar `tier: 'mobile' | 'tablet' | 'desktop'` (breakpoints 768px / 1024px, ver `design-system.md`); `collapsed = tier === 'tablet'`; único `useEffect` permitido: cerrar el drawer (`setSidebarOpen(false)`) cuando cambia `location.pathname`; retorna `{ sidebarOpen, collapsed, tier, toggleSidebar, closeSidebar }`

## 3. Componentes de layout

- [x] 3.1 Implementar `src/components/layout/Sidebar.tsx`: recibe `role: UserRole` y `collapsed: boolean`; construye la lista de ítems por rol (tabla de `proposal.md` §Sidebar) usando iconos de `lucide-react`; renderiza `SidebarNavItem` por cada ítem; fondo `bg-surface-dark`, ancho `var(--sidebar-width)` / `var(--sidebar-collapsed-width)` según `collapsed`, `transition-all duration-200 ease-in-out`; header con iniciales "MFC" + nombre de app (oculto si `collapsed`)
- [x] 3.2 Crear `src/components/layout/SidebarNavItem.tsx`: props `icon`, `label`, `to`, `collapsed`; usa `NavLink` para estado activo (`bg-primary-active` + borde izquierdo 3px `border-info-border`), hover `bg-white/5`; si `collapsed`, solo icono centrado envuelto en `Tooltip` de `src/components/ui/` (sin modificarlo) mostrando `label`
- [x] 3.3 Implementar `src/components/layout/TopBar.tsx`: recibe `role: UserRole`; alto `var(--topbar-height)`, `bg-canvas`, `border-b border-hairline`; zona izquierda con botón `Menu` (solo visible si `tier !== 'desktop'`, llama a `toggleSidebar`/abre drawer); texto contextual según rol (superadmin → `t('layout.superadminPanel')`; admin → `currentGroup?.name ?? t('layout.noGroup')` desde `useCurrentGroup()`; member → `user.firstName + ' ' + user.lastName` desde `useAuth()`); `DropdownMenu` de Shadcn con avatar de iniciales (`bg-surface-strong`, `rounded-full`, 36px) con ítems "Mi cuenta" (navega a `/${role}/settings`) y "Cerrar sesión" (llama `logout()` de `useAuth()` y `navigate('/login', { replace: true })`)
- [x] 3.4 Implementar `src/components/layout/Shell.tsx`: recibe `role: UserRole`; estructura `flex h-screen overflow-hidden bg-canvas` con `Sidebar`, overlay mobile (`bg-black/50 fixed inset-0 z-40`, visible solo si `sidebarOpen && tier === 'mobile'`, `onClick` cierra el drawer), columna derecha con `TopBar` + `<main class="flex-1 overflow-y-auto"><PageWrapper><Outlet /></PageWrapper></main>`
- [x] 3.5 Implementar `src/components/layout/PageWrapper.tsx`: `className="p-4 md:p-6 max-w-[1280px] mx-auto w-full"`

## 4. Componente compartido EmptyState

- [x] 4.1 Implementar `src/components/shared/EmptyState.tsx`: props `icon?: LucideIcon` (default `Inbox`), `title: string`, `description?: string`, `action?: { label: string; onClick: () => void }`; contenedor `flex flex-col items-center justify-center text-center bg-cream p-12`; icono 48px `text-muted`; título `text-lg text-ink`; descripción `text-sm text-body`; si `action`, botón `Button` variant `outline` de `src/components/ui/`

## 5. Claves i18n

- [x] 5.1 Agregar `nav.superadmin.*`, `nav.admin.*`, `nav.member.*` en `src/i18n/locales/es.json` (ver tabla de claves en `proposal.md`)
- [x] 5.2 Agregar `layout.superadminPanel`, `layout.noGroup`, `layout.userMenu.myAccount`, `layout.userMenu.logout` en `es.json`
- [x] 5.3 Agregar `emptyState.defaultTitle`, `emptyState.defaultDescription` en `es.json`
- [x] 5.4 Agregar las mismas claves (`nav.*`, `layout.*`, `emptyState.*`) traducidas al inglés en `src/i18n/locales/en.json`

## 6. Router

- [x] 6.1 En `src/router/index.tsx`, dentro de cada bloque `RoleGuard` (`/superadmin`, `/admin`, `/member`), insertar un nivel de `{ element: <Shell role="..." />, children: [...] }` envolviendo las rutas hijas existentes (los placeholders `div` no cambian)
- [x] 6.2 Importar `Shell` con lazy import (`React.lazy`), igual que las páginas de auth, para no aumentar el bundle inicial

## 7. Verificación final

- [x] 7.1 Ejecutar `npx tsc --noEmit` — sin errores TypeScript
- [x] 7.2 Login admin (`admin.garcia@email.com`) → shell completo, sidebar expandido en desktop, 4 ítems de admin, `TopBar` muestra "Sin grupo"
- [x] 7.3 Login superadmin (`superadmin@medfamilycare.com`) → sidebar con 6 ítems de catálogos, `TopBar` muestra "Panel de administración"
- [x] 7.4 Login member (`maria.garcia@email.com`) → sidebar con 6 ítems personales, `TopBar` muestra nombre completo del usuario
- [x] 7.5 Redimensionar a 768–1024px → sidebar colapsa a solo iconos, tooltip aparece al hover sobre un ítem
- [x] 7.6 Redimensionar a < 768px → sidebar desaparece, botón `Menu` aparece en `TopBar`; al presionarlo se abre el drawer sobre overlay oscuro
- [x] 7.7 Con el drawer abierto en mobile, navegar a otro ítem → el drawer se cierra automáticamente
- [x] 7.8 Dropdown del `TopBar` → "Mi cuenta" navega a `/[rol]/settings`; "Cerrar sesión" limpia la sesión y redirige a `/login`
- [x] 7.9 Recargar la página con el sidebar en modo tablet colapsado y volver a desktop → el sidebar vuelve a expandirse (el colapso es puramente derivado del breakpoint, no queda "pegado")
