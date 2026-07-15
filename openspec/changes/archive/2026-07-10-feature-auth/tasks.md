## 1. Infraestructura compartida (router utils + store)

- [x] 1.1 Crear `src/router/utils.ts` con función `getDashboardRoute(role: UserRole): string` (superadmin → `/superadmin/users`, admin → `/admin/dashboard`, member → `/member/dashboard`)
- [x] 1.2 Verificar `src/stores/auth.store.ts` — si no tiene `persist` middleware de Zustand, agregar con `name: APP_CONFIG.session.storageKey`; confirmar que expone `user`, `setUser`, `clearUser`

## 2. Servicio de autenticación

- [x] 2.1 Crear `src/features/auth/services/auth.service.ts` con clase `AuthError extends Error` y tipo `AuthErrorCode`
- [x] 2.2 Implementar `authService.login(email, password)`: buscar en `mockUsers`, simular delay, lanzar `AuthError('ACCOUNT_DISABLED')` si `isActive: false`, lanzar `AuthError('INVALID_CREDENTIALS')` si no match, devolver `{ user, mustChangePassword }`
- [x] 2.3 Implementar `authService.changePassword(userId, currentPassword, newPassword)`: validar contraseña actual, rechazar si `newPassword === currentPassword`, mutar `mockUsers` y marcar `mustChangePassword: false`
- [x] 2.4 Implementar `authService.requestPasswordReset(email)`: simular delay, resolver siempre con `{ sent: true }`
- [x] 2.5 Implementar `authService.getDevUsers()`: devolver proyección reducida de `mockUsers` sin delay (solo para `DevRoleSwitcher`)

## 3. Schemas Zod

- [x] 3.1 Crear `src/features/auth/schemas/auth.schema.ts` con `loginSchema` (email + password requeridos)
- [x] 3.2 Agregar `changePasswordSchema` con reglas de complejidad (8 chars, mayúscula, minúscula, número, especial) y refine de coincidencia `newPassword === confirmPassword`
- [x] 3.3 Agregar `forgotPasswordSchema` con email requerido y formato válido
- [x] 3.4 Exportar tipos inferidos: `LoginFormValues`, `ChangePasswordFormValues`, `ForgotPasswordFormValues`

## 4. Hooks

- [x] 4.1 Crear `src/features/auth/hooks/useLogin.ts` con `useMutation` que llama a `authService.login`, en `onSuccess` llama `setUser` y navega según `mustChangePassword` o `getDashboardRoute(role)`
- [x] 4.2 Crear `src/features/auth/hooks/useChangePassword.ts` con `useMutation` que llama a `authService.changePassword`, en `onSuccess` actualiza store con `mustChangePassword: false` y navega al dashboard
- [x] 4.3 Crear `src/features/auth/hooks/useForgotPassword.ts` con `useMutation` que llama a `authService.requestPasswordReset`
- [x] 4.4 Crear `src/features/auth/hooks/useDevUsers.ts` con `useQuery` que llama a `authService.getDevUsers()`, `enabled: import.meta.env.DEV`, `staleTime: Infinity`

## 5. Claves i18n

- [x] 5.1 Agregar claves `auth.*` (login, changePassword, forgotPassword, errors, logout, devRoleSwitcher) en `src/i18n/locales/es.json`
- [x] 5.2 Agregar claves `validation.*` (required, email, password.*) en `src/i18n/locales/es.json`
- [x] 5.3 Agregar las mismas claves en inglés en `src/i18n/locales/en.json`

## 6. Componentes

- [x] 6.1 Crear `src/features/auth/components/AuthLayout.tsx`: fondo `--color-surface-soft`, card centrado max-400px con logo, nombre de app, subtexto dinámico vía prop, footer `© 2026 MedFamilyCare`
- [x] 6.2 Crear `src/features/auth/components/LoginForm.tsx`: campos email y password con toggle show/hide, botón con spinner en `isPending`, link a forgot-password, error inline por `mutation.error.code`
- [x] 6.3 Crear `src/features/auth/components/ChangePasswordForm.tsx`: tres campos password con toggle, checklist visual de reglas en tiempo real bajo `newPassword`, error inline por código de error
- [x] 6.4 Crear `src/features/auth/components/ForgotPasswordForm.tsx`: campo email, botón con spinner, toast Sonner en éxito, estado post-envío con opción de reenviar, link de vuelta al login
- [x] 6.5 Crear `src/features/auth/components/DevRoleSwitcher.tsx`: guarda `if (!import.meta.env.DEV) return null`, Select de Shadcn/ui con los 6 usuarios, llama `onSelectUser(email, password)` al seleccionar; integrar en `LoginForm` vía prop `onSelectUser` conectada a `form.setValue`

## 7. Páginas

- [x] 7.1 Crear `src/features/auth/pages/LoginPage.tsx`: renderiza `<AuthLayout>` con `<LoginForm />`
- [x] 7.2 Crear `src/features/auth/pages/ChangePasswordPage.tsx`: guard declarativo `if (!user) return <Navigate to="/login" replace />`; renderiza `<AuthLayout>` con `<ChangePasswordForm />`
- [x] 7.3 Crear `src/features/auth/pages/ForgotPasswordPage.tsx`: renderiza `<AuthLayout>` con `<ForgotPasswordForm />`
- [x] 7.4 Crear `src/features/auth/index.ts` con barrel export de las tres páginas

## 8. Guards de ruta y router

- [x] 8.1 Actualizar `src/router/ProtectedRoute.tsx`: leer `user` del store y `location`; si `!user`, redirigir a `/login` con `state={{ from: location }}`
- [x] 8.2 Actualizar `src/router/RoleGuard.tsx`: si `user.role !== role`, redirigir a `getDashboardRoute(user.role)`
- [x] 8.3 Actualizar `src/router/index.tsx`: reemplazar elementos placeholder de `/login`, `/login/change-password`, `/login/forgot-password` con lazy imports reales de `@/features/auth`

## 9. Verificación final

- [x] 9.1 Ejecutar `npx tsc --noEmit` — sin errores TypeScript
- [x] 9.2 Verificar Flujo A en browser: `admin.garcia@email.com / Admin123!` → redirige a `/admin/dashboard`
- [x] 9.3 Verificar Flujo B en browser: `carlos.garcia@email.com / Temp2026!` → redirige a `/login/change-password` → tras cambio de contraseña, redirige al dashboard
- [x] 9.4 Verificar Flujo C: credenciales incorrectas → error inline bajo el botón (sin toast)
- [x] 9.5 Verificar Flujo D: cuenta inactiva → error `accountDisabled` inline
- [x] 9.6 Verificar Flujo F: navegar a `/admin/dashboard` sin sesión → redirige a `/login`
- [x] 9.7 Verificar Flujo G: loguear como member, navegar a `/admin/dashboard` → redirige a `/member/dashboard`
- [x] 9.8 Verificar `DevRoleSwitcher`: visible en `npm run dev`, cada usuario autocompleta el formulario sin hacer login automático
- [x] 9.9 Verificar `DevRoleSwitcher`: ausente en `npm run build && npm run preview`
