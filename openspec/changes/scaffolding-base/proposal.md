## Why

El proyecto MedFamilyCare existe solo como un scaffold vacío de Vite + React. Sin estructura de carpetas, dependencias, design system ni sistema de rutas, no es posible comenzar a construir features. Esta inicialización establece la base técnica completa sobre la que se construirá toda la aplicación.

## What Changes

- Instalar todas las dependencias de producción y desarrollo del stack acordado (React Router, TanStack Query, Zustand, React Hook Form, Zod, Axios, i18next, Tailwind CSS, Shadcn/ui, Lucide React)
- Crear la estructura de carpetas completa (`features/`, `components/`, `stores/`, `router/`, `hooks/`, `lib/`, `mock/`, `i18n/`, `types/`, `config/`, `styles/`)
- Generar el sistema de tipos TypeScript completo (`src/types/index.ts`) con todos los modelos del dominio
- Configurar el design system: variables CSS (light/dark), `tailwind.config.js` con tokens mapeados, y entry point de estilos
- Instalar y configurar componentes base de Shadcn/ui
- Generar los tres stores de Zustand: auth (con persistencia), theme (con aplicación de clase `.dark`) y group
- Configurar i18n con i18next en ES/EN con namespaces base vacíos
- Generar el sistema de rutas completo con React Router v6: `ProtectedRoute`, `RoleGuard`, árbol de rutas para superadmin/admin/member
- Generar `src/lib/`: `utils.ts` (cn, formatDate, formatDateTime, validateFile), `queryClient.ts`, `axios.ts` (con interceptores de token y 401)
- Actualizar `main.tsx` para montar todos los providers y aplicar tema inicial
- Generar mock skeleton: `mock/index.ts`, archivos seed vacíos por entidad, helpers completos (`resolveMember`, `getActiveMedications`, `getUpcomingAppointments`)
- Generar `src/config/app.config.ts` con configuración centralizada

## Capabilities

### New Capabilities

- `project-scaffolding`: Estructura base del proyecto con dependencias, carpetas, configuración de herramientas (Tailwind, Shadcn, Vite) y entry point funcional
- `design-system`: Variables CSS del design system, tokens Tailwind, soporte light/dark mode vía clase `.dark`
- `routing`: Sistema de rutas completo con React Router v6, ProtectedRoute y RoleGuard para tres roles (superadmin, admin, member)
- `state-management`: Stores de Zustand para auth, theme y group con persistencia en localStorage
- `i18n-foundation`: Configuración i18next con idiomas ES/EN y namespaces base para todas las features
- `http-client`: Instancia Axios configurada con interceptores de auth y manejo de 401
- `mock-data-skeleton`: Estructura de mock data centralizada con seeds vacíos y helpers de consulta implementados
- `domain-types`: Tipos TypeScript completos del modelo de datos (enums, interfaces de dominio, sub-interfaces)

### Modified Capabilities

## Impact

- **Archivos nuevos**: ~40+ archivos generados en `src/`
- **Archivos modificados**: `src/main.tsx`, `index.html`, `vite.config.ts`, `tsconfig.json`, `package.json`
- **Dependencias nuevas**: react-router-dom, @tanstack/react-query, axios, zustand, react-hook-form, zod, i18next, react-i18next, lucide-react, clsx, tailwind-merge
- **Dev dependencies**: tailwindcss@3, postcss, autoprefixer, @types/node
- **Sin breaking changes** — es el setup inicial; no hay código existente que romper
- **Restricciones aplicadas en toda la base**: cero strings hardcodeados, cero hex directos en componentes, soft-delete siempre, ISO 8601 para fechas, imports de mock solo desde services/
