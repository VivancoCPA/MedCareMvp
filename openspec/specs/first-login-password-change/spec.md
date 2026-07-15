# first-login-password-change Specification

## Purpose
TBD - created by syncing change feature-auth. Update Purpose after archive.

## Requirements
### Requirement: Cambio de contraseña obligatorio en primer ingreso
El sistema SHALL requerir que el usuario establezca una nueva contraseña antes de acceder a cualquier función de la app cuando `mustChangePassword: true`.

#### Scenario: Redirección automática al flujo de cambio
- **WHEN** login exitoso y `mustChangePassword: true`
- **THEN** la app navega a `/login/change-password` antes de mostrar cualquier contenido protegido

#### Scenario: Guard directo a change-password sin sesión
- **WHEN** un usuario no autenticado navega directamente a `/login/change-password`
- **THEN** la página redirige a `/login`

### Requirement: Validación de contraseña actual en cambio de contraseña
El sistema SHALL verificar que la contraseña actual proporcionada coincida con la registrada en `mockUsers` antes de aceptar la nueva contraseña.

#### Scenario: Contraseña actual incorrecta
- **WHEN** el usuario envía una contraseña actual que no coincide con su registro
- **THEN** el sistema lanza `AuthError('INVALID_CURRENT_PASSWORD')` y el formulario muestra el error inline

### Requirement: Restricción de reutilización de contraseña
El sistema SHALL rechazar la nueva contraseña si es idéntica a la contraseña actual.

#### Scenario: Nueva contraseña igual a la actual
- **WHEN** el usuario envía `newPassword` igual a `currentPassword`
- **THEN** el sistema lanza `AuthError('SAME_AS_CURRENT')` antes de actualizar ningún registro

### Requirement: Reglas de complejidad de contraseña
La nueva contraseña SHALL cumplir todos los siguientes requisitos: mínimo 8 caracteres, al menos una letra mayúscula, al menos una letra minúscula, al menos un número, al menos un carácter especial.

#### Scenario: Contraseña que cumple todas las reglas
- **WHEN** el usuario ingresa una contraseña que satisface los 5 criterios
- **THEN** la validación Zod pasa y el formulario puede enviarse

#### Scenario: Contraseña que no cumple alguna regla
- **WHEN** el usuario ingresa una contraseña que falla uno o más criterios
- **THEN** la validación Zod rechaza el formulario con el mensaje de error específico de la regla violada

#### Scenario: Checklist visual en tiempo real
- **WHEN** el usuario escribe en el campo `newPassword`
- **THEN** cada regla muestra un indicador visual (satisfecha / no satisfecha) actualizado carácter a carácter

### Requirement: Actualización del store tras cambio exitoso
El sistema SHALL actualizar el objeto `User` en el `auth.store` para reflejar `mustChangePassword: false` tras un cambio de contraseña exitoso, antes de navegar al dashboard.

#### Scenario: Store actualizado y redirección al dashboard
- **WHEN** el cambio de contraseña es exitoso
- **THEN** el store refleja `mustChangePassword: false` y la app navega al dashboard del rol del usuario

### Requirement: Coincidencia de confirmación de contraseña
El sistema SHALL rechazar el formulario si `confirmPassword` no es idéntico a `newPassword`.

#### Scenario: Contraseñas no coinciden
- **WHEN** el usuario envía `newPassword` y `confirmPassword` con valores distintos
- **THEN** la validación Zod rechaza el campo `confirmPassword` con el mensaje de error de coincidencia
