## Why

MedFamilyCare necesita un módulo de autenticación funcional como punto de entrada a la app. Sin login real, los guards de ruta son placeholders que no protegen nada y los 6 usuarios mock no tienen flujo de acceso verificable. Este change activa la autenticación completa y establece el patrón `Service → Hook → Component` que todos los features posteriores replicarán.

## What Changes

- **Nuevo**: `authService` con `login`, `changePassword`, `requestPasswordReset` y `getDevUsers` — único punto de contacto con `mockUsers`
- **Nuevo**: Schemas Zod para login, cambio de contraseña y recuperación de contraseña
- **Nuevo**: Hooks `useLogin`, `useChangePassword`, `useForgotPassword`, `useDevUsers`
- **Nuevo**: Componentes `LoginForm`, `ChangePasswordForm`, `ForgotPasswordForm`, `AuthLayout`, `DevRoleSwitcher`
- **Nuevo**: Páginas `LoginPage`, `ChangePasswordPage`, `ForgotPasswordPage`
- **Nuevo**: `src/router/utils.ts` con `getDashboardRoute` (shared utility)
- **Modificado**: `ProtectedRoute` y `RoleGuard` — activar lógica real (antes eran pass-through)
- **Modificado**: `src/router/index.tsx` — reemplazar placeholders con lazy imports reales
- **Modificado**: `src/stores/auth.store.ts` — agregar persistencia via Zustand `persist` si falta
- **Modificado**: `es.json` / `en.json` — agregar claves `auth.*` y `validation.*`

## Capabilities

### New Capabilities

- `user-authentication`: Login con email/password, gestión de sesión en Zustand con persistencia localStorage, guards de ruta reales (ProtectedRoute + RoleGuard), redirección post-login según rol
- `first-login-password-change`: Flujo forzado de cambio de contraseña cuando `mustChangePassword: true`; checklist visual de reglas en tiempo real
- `password-recovery`: Solicitud de recuperación de contraseña por email; respuesta genérica que no revela si el email existe

### Modified Capabilities

<!-- No existing specs change requirements — guards y store existían como placeholders sin spec de comportamiento -->

## Impact

- **Router**: `ProtectedRoute` y `RoleGuard` ahora redirigen; cualquier ruta protegida sin sesión fuerza `/login`
- **Auth store**: Se agrega `persist` middleware — el estado sobrevive recargas de página
- **Mock data**: `auth.service.ts` muta `mockUsers` al cambiar contraseña (array en memoria); el cambio se pierde al recargar, comportamiento esperado en modo mock
- **Build de producción**: `DevRoleSwitcher` se elimina por tree-shaking (`import.meta.env.DEV`); cero impacto en bundle de producción
- **i18n**: Se agregan ~50 claves nuevas bajo `auth.*` y `validation.*` en ambos locales
