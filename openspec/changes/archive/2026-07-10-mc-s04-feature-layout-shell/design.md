## Context

Las tres áreas protegidas (`superadmin`, `admin`, `member`) actualmente montan páginas placeholder directamente bajo `RoleGuard`, sin ningún componente de layout entre medio. `src/components/layout/{Shell,Sidebar,TopBar,PageWrapper}.tsx` y `src/components/shared/EmptyState.tsx` ya existen en el repo como stubs (`return null` o pass-through vacío) — este change les da implementación real, no los crea desde cero.

`tailwind.config.js` ya fue corregido (change previo) para mapear un vocabulario extenso de tokens (`ink`, `body`, `muted`, `canvas`, `surface-soft`, `surface-strong`, `surface-dark`, `hairline`, `border-strong`, `link`, `success`/`success-border`, `info`/`info-border`, `signature-coral/mint/peach/cream/forest`) hacia variables CSS `--color-*`. `src/styles/globals.css`, sin embargo, solo define un subconjunto pequeño y con nombres/valores parcialmente distintos (`--color-surface`, sin `-soft`/`-strong`; falta `--color-body`, `--color-muted`, `--color-hairline`, todos los `--color-signature-*`, etc.). Esto es la misma clase de bug ya documentada y corregida una vez para los alias de Shadcn: clases Tailwind que compilan pero no resuelven a ningún color porque la variable CSS que referencian no existe.

No existe un documento en `openspec/specs/` con los valores exactos de esos tokens faltantes — el comentario en `tailwind.config.js` referencia `05-especificaciones-tecnicas-frontend.md`, que no está presente en este repo. Los valores que se agregan en este change son una extrapolación razonable de la paleta ya documentada en `openspec/specs/design-system.md`, marcados explícitamente como best-effort para revisión visual posterior.

## Goals / Non-Goals

**Goals:**
- Implementar `Shell`, `Sidebar`, `SidebarNavItem`, `TopBar`, `PageWrapper`, `EmptyState` con comportamiento real
- Navegación por rol, responsive (desktop expandido / tablet iconos / mobile drawer)
- Identidad contextual y logout funcional en el `TopBar`
- Cerrar la brecha entre `tailwind.config.js` y `globals.css` para los tokens que estos componentes consumen
- Insertar `Shell` en las tres ramas del router sin tocar las rutas hijas

**Non-Goals:**
- Hidratar `group.store.currentGroup` — no hay ningún flujo de carga de grupo todavía; el `TopBar` solo lee el store como está
- Un botón de colapso manual del sidebar en desktop — la spec de responsive design dice "siempre visible, expandido" en desktop sin excepción; `sidebarCollapsed`/`toggleSidebar` quedan expuestos en `ui.store` para un control futuro, pero ninguna UI de este change los dispara
- Sincronizar el resto de la brecha `design-system.md` ↔ `globals.css` no relacionada con layout (p. ej. `--font-display`, `--shadow-*` no usados por estos componentes)
- Corregir `AuthLayout.tsx` (usa `bg-surface`/`border-border`, tokens que tampoco resuelven hoy) — pertenece a `feature-auth`, ya marcado como no tocar

## Decisions

### D1 — Usar `Shell.tsx` en vez de crear `AppLayout.tsx`

**Decisión**: El componente raíz del layout se llama `Shell`, recibe `role: UserRole` como prop, e implementa el stub existente en `src/components/layout/Shell.tsx`.

**Por qué**: `frontend-architecture.md` ya documenta la carpeta `layout/` como "Shell, Sidebar, TopBar, PageWrapper", y el archivo `Shell.tsx` ya existe como stub. Crear `AppLayout.tsx` en paralelo dejaría dos componentes raíz de layout en el repo, uno huérfano.

**Alternativa descartada**: Crear `AppLayout.tsx` tal como pedía la propuesta original — inconsistente con el spec ya archivado y con el stub existente.

---

### D2 — Breakpoint del sidebar derivado, no persistido vía efecto

**Decisión**: `useSidebar` obtiene el tier de viewport (`mobile` / `tablet` / `desktop`) con `useSyncExternalStore` sobre `window.matchMedia`, sin `useEffect`. El colapso visual se deriva en cada render: `collapsed = tier === 'tablet'`. El flag persistido `ui.store.sidebarCollapsed` no participa en este cálculo en este change — queda en el store como API pública para un futuro control manual de colapso en desktop, pero no se lee para decidir el render actual.

**Por qué**: Evita un segundo `useEffect` que sincronizara breakpoint → store (el único `useEffect` permitido en `useSidebar`, según R5 de la propuesta original, es el que cierra el drawer al cambiar de ruta). `useSyncExternalStore` es la forma correcta de suscribirse a una fuente externa (el viewport) sin caer en "useEffect para derivar estado".

**Alternativa descartada**: Escuchar `resize` en un `useEffect` y escribir `setSidebarCollapsed(...)` — introduce un segundo efecto y un round-trip de escritura al store que no aporta nada porque el valor se recalcula en cada resize de todas formas.

---

### D3 — Sincronización de tokens CSS: valores concretos agregados a `globals.css`

**Decisión**: se agregan las siguientes variables (modo claro / `.dark`), eligiendo valores consistentes con la paleta ya documentada en `design-system.md` donde el nombre coincide, y derivando el resto:

| Variable | Claro | Oscuro | Origen |
|---|---|---|---|
| `--color-body` | `#4b5563` | `#94a3b8` | = `--color-ink-secondary` de `design-system.md` |
| `--color-muted` | `#9ca3af` | `#64748b` | derivado — gris intermedio entre `body` y `border` |
| `--color-surface-soft` | `#f8f9fb` | `#181d26` | = `--color-surface` de `design-system.md` |
| `--color-surface-strong` | `#e5e7eb` | `#252d3d` | derivado — un paso más oscuro que `surface-soft` |
| `--color-hairline` | `#e5e7eb` | `#1e2535` | = `--color-border` de `design-system.md` |
| `--color-border-strong` | `#d1d5db` | `#334155` | derivado — hairline con más contraste |
| `--color-success-border` | `#86efac` | `#166534` | derivado de `--color-success` |
| `--color-info` | `#1b61c9` | `#60a5fa` | = `--color-link` de `design-system.md` |
| `--color-info-border` | `#93c5fd` | `#1e40af` | derivado de `--color-info` |
| `--color-signature-cream` | `#faf7f0` | `#20261f` | tono neutro cálido para fondos de empty state |
| `--color-signature-coral` | `#f4a896` | `#c2410c` | placeholder — no usado por este change salvo mapeo de `destructive` |
| `--color-signature-mint` / `-peach` / `-forest` | placeholders neutros | placeholders neutros | no consumidos por `layout-shell`; se agregan solo para que `tailwind.config.js` no falle silenciosamente |
| `--radius-xs` | `0.125rem` | — | = spec `design-system.md` |
| `--sidebar-collapsed-width` | `64px` | — | nuevo, requerido por `Sidebar` |

`--sidebar-width` (240px) y `--topbar-height` (64px) ya existen y no cambian.

**Por qué**: sin estas variables, clases como `bg-cream`, `border-hairline`, `text-muted`, `ring` (mapeado a `--color-info-border`) no resuelven a ningún color — el mismo bug silencioso ya corregido una vez para los alias de Shadcn.

**Riesgo aceptado**: los valores de colores "derivados" (marcados arriba) son aproximaciones razonables, no valores de un design doc autoritativo — `05-especificaciones-tecnicas-frontend.md` no está en este repo. Deben tratarse como placeholders sujetos a ajuste visual cuando ese documento esté disponible.

---

### D4 — Overlay mobile vive en `Shell`, no en `Sidebar`

**Decisión**: el `<div className="bg-black/50 fixed inset-0 z-40" />` del overlay mobile se renderiza en `Shell`, condicionado a `sidebarOpen && tier === 'mobile'`, no dentro de `Sidebar`.

**Por qué**: mantiene a `Sidebar` encapsulado en su propia presentación; el overlay es un concern del layout completo (debe cubrir `TopBar` y `main` también), no del sidebar en sí.

---

### D5 — Logout sin `useLogout()` — no existe ese hook

**Decisión**: `TopBar` llama `useAuthStore((s) => s.logout)` directamente (o `useAuth().logout`) y luego `navigate('/login', { replace: true })` con `useNavigate()` de `react-router-dom`.

**Por qué**: la propuesta original asumía un hook `useLogout()` en `feature-auth` que no existe — solo hay `authStore.logout()` (acción del store) y la clave i18n `auth.logout`. No se re-implementa nada nuevo en `feature-auth`; se consume el store existente directamente, como ya hace `useAuth()`.

## Risks / Trade-offs

| Riesgo | Mitigación |
|---|---|
| Valores de tokens CSS "derivados" (D3) no coinciden con el diseño visual real pretendido | Aislados a `globals.css`; ajuste centralizado de una sola vez cuando exista el doc de diseño completo |
| `useSyncExternalStore` sobre `matchMedia` sin `SSR` — acceso a `window` fuera de render | Este proyecto es SPA pura con Vite (sin SSR); `getSnapshot`/`subscribe` solo se ejecutan en cliente |
| `sidebarCollapsed` persistido en `ui.store` queda sin efecto visual real en este change | Documentado como Non-Goal (D2); no se elimina del store para no romper el contrato pedido en la propuesta original |
| `TopBar` en rol `admin` siempre mostrará "Sin grupo" hasta que exista hidratación de `group.store` | Documentado como Non-Goal; comportamiento visible pero esperado hasta el change de grupos |
| Nuevas claves i18n deben mantenerse sincronizadas en `es.json` y `en.json` | Se agregan ambas en el mismo change; `i18next` usa `fallbackLng: 'en'`, así que una clave faltante en `es` no rompe la build pero sí deja texto en inglés visible |
