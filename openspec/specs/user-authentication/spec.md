# user-authentication Specification

## Purpose
TBD - created by syncing change feature-auth. Update Purpose after archive.

## Requirements
### Requirement: Login con credenciales válidas
El sistema SHALL autenticar a un usuario que provea email y contraseña que coincidan con un registro activo en `mockUsers`, devolviendo el objeto `User` y el flag `mustChangePassword`.

#### Scenario: Credenciales correctas — usuario activo sin cambio de contraseña pendiente
- **WHEN** el usuario envía email y contraseña válidos y `mustChangePassword: false`
- **THEN** el sistema resuelve con `{ user, mustChangePassword: false }` y el store guarda el usuario

#### Scenario: Credenciales correctas — usuario activo con cambio de contraseña pendiente
- **WHEN** el usuario envía credenciales válidas y el registro tiene `mustChangePassword: true`
- **THEN** el sistema resuelve con `{ user, mustChangePassword: true }` y la app navega a `/login/change-password`

### Requirement: Rechazo de credenciales inválidas
El sistema SHALL lanzar `AuthError` con código `INVALID_CREDENTIALS` si el email no existe en `mockUsers` o si la contraseña no coincide.

#### Scenario: Email no registrado
- **WHEN** el usuario envía un email que no existe en `mockUsers`
- **THEN** el sistema lanza `AuthError('INVALID_CREDENTIALS')` sin revelar si el email existe

#### Scenario: Contraseña incorrecta
- **WHEN** el usuario envía un email válido pero contraseña incorrecta
- **THEN** el sistema lanza `AuthError('INVALID_CREDENTIALS')`

### Requirement: Rechazo de cuenta inactiva
El sistema SHALL lanzar `AuthError` con código `ACCOUNT_DISABLED` cuando las credenciales son válidas pero `isActive === false`.

#### Scenario: Cuenta desactivada
- **WHEN** el usuario envía credenciales correctas pero su registro tiene `isActive: false`
- **THEN** el sistema lanza `AuthError('ACCOUNT_DISABLED')` antes de devolver ningún dato de usuario

### Requirement: Simulación de latencia de red
El sistema SHALL introducir un delay de `APP_CONFIG.mock.simulatedDelayMs` milisegundos en cada llamada a `login` para simular comportamiento de red real.

#### Scenario: Delay visible durante login
- **WHEN** el usuario envía el formulario de login
- **THEN** el botón muestra estado de carga durante al menos `simulatedDelayMs` ms antes de resolver o rechazar

### Requirement: Redirección post-login según rol
El sistema SHALL navegar al dashboard correspondiente al rol del usuario tras un login exitoso sin cambio de contraseña pendiente.

#### Scenario: Redirección superadmin
- **WHEN** login exitoso con `role: 'superadmin'`
- **THEN** la app navega a `/superadmin/users`

#### Scenario: Redirección admin
- **WHEN** login exitoso con `role: 'admin'`
- **THEN** la app navega a `/admin/dashboard`

#### Scenario: Redirección member
- **WHEN** login exitoso con `role: 'member'`
- **THEN** la app navega a `/member/dashboard`

### Requirement: Persistencia de sesión en localStorage
El sistema SHALL serializar el estado de autenticación en `localStorage` bajo la clave `APP_CONFIG.session.storageKey` para que la sesión sobreviva recargas de página.

#### Scenario: Sesión persistida tras recarga
- **WHEN** el usuario está autenticado y recarga la página
- **THEN** el `auth.store` rehidrata desde `localStorage` y el usuario permanece autenticado sin necesidad de volver a hacer login

#### Scenario: Sesión eliminada al cerrar sesión
- **WHEN** el usuario ejecuta logout (`clearUser`)
- **THEN** `localStorage` pierde la entrada y la próxima recarga inicia sesión limpia

### Requirement: Protección de rutas privadas
El sistema SHALL redirigir a `/login` a cualquier usuario no autenticado que intente acceder a una ruta protegida.

#### Scenario: Acceso directo a ruta protegida sin sesión
- **WHEN** un usuario no autenticado navega a cualquier ruta bajo `/admin`, `/member` o `/superadmin`
- **THEN** `ProtectedRoute` redirige a `/login` preservando la URL de origen en `state.from`

### Requirement: Guard de rol
El sistema SHALL redirigir al dashboard del rol del usuario autenticado si intenta acceder a una sección de un rol diferente.

#### Scenario: Member intenta acceder a área de admin
- **WHEN** un usuario con `role: 'member'` navega a `/admin/dashboard`
- **THEN** `RoleGuard` redirige a `/member/dashboard`

#### Scenario: Admin intenta acceder a área de superadmin
- **WHEN** un usuario con `role: 'admin'` navega a `/superadmin/users`
- **THEN** `RoleGuard` redirige a `/admin/dashboard`

### Requirement: Selector de rol en modo desarrollo
El sistema SHALL incluir un componente `DevRoleSwitcher` visible únicamente en `import.meta.env.DEV` que precargue las credenciales de un usuario mock en el formulario de login.

#### Scenario: Selector visible en modo desarrollo
- **WHEN** la app corre con `npm run dev`
- **THEN** `DevRoleSwitcher` aparece encima del formulario de login mostrando los 6 usuarios mock

#### Scenario: Selector ausente en producción
- **WHEN** la app se construye con `npm run build`
- **THEN** `DevRoleSwitcher` no aparece en el bundle de producción (eliminado por tree-shaking)

#### Scenario: Precargar credenciales sin login automático
- **WHEN** el usuario selecciona un rol en `DevRoleSwitcher`
- **THEN** el formulario se autocompleta con email y contraseña del usuario seleccionado, pero el login no se ejecuta hasta que el usuario presione "Ingresar"
