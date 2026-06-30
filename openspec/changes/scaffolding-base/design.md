## Context

MedFamilyCare es una app web de gestión de historial médico familiar con tres roles diferenciados: superadmin (gestión global), admin (gestión de grupos familiares) y member (usuario final). El proyecto parte de un scaffold vacío de Vite + React 19, sin dependencias adicionales ni estructura. Esta fase de scaffolding establece todas las decisiones arquitectónicas que regirán el desarrollo de features.

Stack definido: React 19, TypeScript 5, Vite 5, Tailwind CSS 3, Shadcn/ui, Zustand 4, TanStack Query 5, React Router 6, React Hook Form 7, Zod 3, Axios, i18next.

Restricciones transversales que impactan el diseño:
- Cero strings hardcodeados en componentes (siempre `t('key')`)
- Cero `useEffect` para derivar estado
- Cero imports de `src/mock/` desde componentes o hooks (solo desde `services/`)
- Cero valores hex directamente en componentes (siempre variables CSS o tokens Tailwind)
- Soft-delete siempre — nunca borrado físico
- `memberId` nunca se asume User — siempre verificar `memberType`
- Fechas: ISO 8601 en datos, `formatDate()`/`formatDateTime()` en UI

## Goals / Non-Goals

**Goals:**
- Instalar y configurar todas las dependencias del stack definido
- Crear estructura de carpetas que soporte la arquitectura feature-first
- Establecer el design system completo (tokens CSS, Tailwind, dark mode)
- Configurar routing con guards por rol y estado de auth
- Generar stores de Zustand con persistencia en localStorage
- Configurar i18n con soporte ES/EN desde el inicio
- Crear la capa de tipos TypeScript completa para todos los modelos de dominio
- Generar infraestructura HTTP (Axios + QueryClient) lista para conectar a la API
- Generar mock skeleton con helpers de consulta implementados
- Lograr que `npm run dev` arranque y `/login` renderice sin errores de TypeScript

**Non-Goals:**
- Implementar autenticación real contra backend
- Construir ninguna pantalla o feature más allá de placeholders mínimos en el router
- Generar datos mock realistas (seeds serán arrays vacíos)
- Configurar CI/CD ni testing
- Optimización de bundle size o performance

## Decisions

### D1 — Feature-first folder structure (no layer-first)
Organizar `src/features/<domain>/` en lugar de `src/pages/`, `src/services/`, `src/hooks/` globales.

**Por qué**: Con 9+ dominios (auth, users, groups, health-profile, appointments, consultation-results, auxiliary-exams, free-notes, dashboard) y tres roles, una estructura layer-first crea interdependencias entre features difíciles de trazar. Feature-first mantiene la cohesión: cada feature tiene sus propios componentes, hooks, services y tipos colocados juntos.

**Alternativa descartada**: Layer-first (pages/components/hooks/services). Genera acoplamiento implícito entre features y dificulta identificar qué pertenece a qué dominio.

**Excepción**: `src/components/ui/` (generado por Shadcn), `src/components/layout/`, `src/components/shared/`, `src/lib/`, `src/stores/` y `src/hooks/` siguen siendo globales porque son infraestructura compartida, no features.

### D2 — Zustand para estado global, TanStack Query para estado de servidor
No usar Context API para estado global ni `useEffect` para sincronizar estado derivado.

**Por qué**: Context API causa re-renders en cascada difíciles de controlar con múltiples consumidores. Zustand es más predecible, más simple de persistir en localStorage, y no requiere providers anidados. TanStack Query maneja caché, revalidación, loading/error states sin `useEffect`, eliminando la restricción de "cero useEffect para derivar estado".

**Alternativa descartada**: Redux Toolkit. Demasiado boilerplate para un proyecto donde el estado del servidor lo maneja TanStack Query. Solo quedan 3 slices globales reales (auth, theme, group).

### D3 — Acceso a mock data exclusivamente a través de services/
Los componentes y hooks nunca importan directamente desde `src/mock/`. Solo `services/` puede importar de `src/mock/`.

**Por qué**: Cuando se conecte la API real, solo los services cambian, no los componentes ni hooks. Mantiene la separación entre capa de presentación y fuente de datos.

**Implementación**: `mock/index.ts` re-exporta todos los seeds. Los helpers de `mock/helpers/` son funciones puras que reciben los seeds como parámetros (sin imports circulares).

### D4 — Design system basado en CSS custom properties + Tailwind con tokens mapeados
Los colores, radii y tipografía se definen como variables CSS en `globals.css` y se mapean en `tailwind.config.js` como tokens. Los componentes usan clases como `bg-canvas`, `text-ink`, `border-border`.

**Por qué**: Permite dark mode mediante toggle de clase `.dark` en `documentElement` sin duplicar estilos. Las variables CSS garantizan coherencia sin valores hex hardcodeados en componentes. Shadcn/ui ya usa esta convención con `--background`, `--foreground`, etc., por lo que se integran bien.

**Dark mode**: El store `theme.store.ts` aplica/remueve la clase `.dark` en `document.documentElement` al cambiar el tema. Se inicializa desde `prefers-color-scheme` si no hay valor persistido.

### D5 — React Router v6 con RouterProvider y createBrowserRouter
Usar la API objeto de React Router v6 (`createBrowserRouter` + `RouterProvider`) en lugar de JSX `<BrowserRouter>`.

**Por qué**: La API objeto permite loaders/actions en el futuro sin refactorizar el router. Soporta errores de boundary por ruta. Los guards (`ProtectedRoute`, `RoleGuard`) se implementan como componentes wrapper dentro del árbol de rutas.

**Árbol de rutas**:
- `/` → redirect según rol del usuario autenticado
- Rutas públicas: `/login`, `/login/change-password`, `/login/forgot-password`
- Rutas privadas: `/superadmin/*`, `/admin/*`, `/member/*`
- Las páginas inexistentes se referencian como componentes placeholder inline en el router

### D6 — i18next con namespace único flat (sin lazy-loading inicial)
Un solo namespace por defecto para el scaffolding, con estructura de claves por feature en `es.json` y `en.json`.

**Por qué**: El lazy-loading de namespaces agrega complejidad innecesaria en esta fase. Con todos los strings en un archivo plano, el bundle inicial es manejable y se puede migrar a namespace splitting cuando el volumen lo justifique.

**Idioma por defecto**: ES. Fallback: EN.

### D7 — Validación de archivos centralizada en app.config.ts
Los límites de tamaño y tipos MIME permitidos se definen en `APP_CONFIG.upload` y se consumen desde `lib/utils.ts::validateFile()`.

**Por qué**: Centraliza la regla de negocio en un solo lugar. Cuando el backend cambie los límites, solo se actualiza `app.config.ts`.

### D8 — Interceptor 401 dispara logout automático
El interceptor de response de Axios llama a `useAuthStore.getState().logout()` al recibir 401.

**Por qué**: Evita que el usuario quede en un estado inconsistente con token expirado. Es el comportamiento estándar de SPA con JWT. Se usa `getState()` (acceso imperativo al store) para no necesitar el hook de React fuera de componentes.

## Risks / Trade-offs

**[Riesgo] Shadcn/ui init puede fallar en entornos sin `npx` interactivo** → Mitigation: Documentar el comando exacto en tasks.md y verificar salida manualmente antes de continuar con la instalación de componentes.

**[Riesgo] Tailwind CSS 3 con Vite 5 requiere configuración específica de PostCSS** → Mitigation: Usar `tailwind.config.js` (CJS) no ESM y verificar que `postcss.config.js` esté en la raíz.

**[Riesgo] `clsx` + `tailwind-merge` agregan ~4KB al bundle** → Mitigation: Aceptable para un admin dashboard. `tailwind-merge` es necesario para que Shadcn/ui funcione correctamente con clases condicionales.

**[Riesgo] El mock skeleton con seeds vacíos puede ocultar bugs de tipos en los helpers** → Mitigation: Los helpers (`resolveMember`, `getActiveMedications`, `getUpcomingAppointments`) deben estar completamente tipados con los tipos de `src/types/index.ts`.

**[Trade-off] Router v6 API objeto vs JSX** → La API objeto tiene una curva de aprendizaje ligeramente mayor pero el beneficio de loaders/actions futuros sin refactorizar justifica la elección. Los placeholders inline en el router son temporales y se reemplazarán al construir las features.

## Migration Plan

No hay estado previo que migrar. El proceso es lineal:
1. `npm install` de todas las dependencias
2. Configurar Tailwind + PostCSS
3. Inicializar Shadcn/ui e instalar componentes base
4. Crear estructura de carpetas
5. Generar archivos en orden de dependencias: tipos → config → lib → stores → i18n → router → mock → styles → main.tsx
6. Verificar con `npm run dev` y navegar a `/login`

No hay rollback strategy porque no hay código existente que preservar.

## Open Questions

- ¿Se necesita `@types/react-router-dom` o las typedefs vienen incluidas en v6? (Incluidas — no es necesario instalar por separado)
- ¿Shadcn/ui con Tailwind 3 requiere algún patch específico? (No en Vite — el CLI detecta Tailwind automáticamente)
