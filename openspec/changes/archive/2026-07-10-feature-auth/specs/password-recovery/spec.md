## ADDED Requirements

### Requirement: Solicitud de recuperación de contraseña
El sistema SHALL aceptar una solicitud de recuperación de contraseña vía email y responder con confirmación genérica, sin revelar si el email está registrado.

#### Scenario: Solicitud con email registrado
- **WHEN** el usuario envía el formulario con un email que existe en `mockUsers`
- **THEN** el sistema resuelve con `{ sent: true }` y muestra un toast genérico de confirmación

#### Scenario: Solicitud con email no registrado
- **WHEN** el usuario envía el formulario con un email que no existe en `mockUsers`
- **THEN** el sistema igualmente resuelve con `{ sent: true }` y muestra el mismo toast genérico (no revela si el email existe)

### Requirement: Simulación de latencia en recuperación de contraseña
El sistema SHALL introducir un delay de `APP_CONFIG.mock.simulatedDelayMs` milisegundos en `requestPasswordReset` para simular envío de email.

#### Scenario: Delay visible durante solicitud
- **WHEN** el usuario envía el formulario de recuperación
- **THEN** el botón muestra estado de carga durante al menos `simulatedDelayMs` ms antes de mostrar la confirmación

### Requirement: Estado post-envío en formulario de recuperación
El sistema SHALL mostrar un estado visual de "solicitud enviada" tras el envío exitoso, con opción de reenviar la solicitud.

#### Scenario: Estado enviado tras éxito
- **WHEN** la solicitud de recuperación resuelve con éxito
- **THEN** el formulario muestra el mensaje `auth.forgotPassword.sentState` y una opción para reenviar

#### Scenario: Reenviar solicitud
- **WHEN** el usuario hace click en la opción de reenviar desde el estado post-envío
- **THEN** el formulario regresa al estado inicial y el usuario puede enviar nuevamente

### Requirement: Validación de email en formulario de recuperación
El sistema SHALL requerir que el campo de email sea un formato válido antes de enviar la solicitud.

#### Scenario: Email vacío
- **WHEN** el usuario intenta enviar el formulario con el campo de email vacío
- **THEN** la validación Zod rechaza el formulario con el mensaje de campo requerido

#### Scenario: Email con formato inválido
- **WHEN** el usuario ingresa un texto que no es un email válido
- **THEN** la validación Zod rechaza el formulario con el mensaje de formato de email inválido

### Requirement: Navegación desde recuperación al login
El sistema SHALL proveer un enlace visible desde la página de recuperación de contraseña hacia la página de login.

#### Scenario: Volver al login
- **WHEN** el usuario hace click en el enlace "Volver al inicio de sesión"
- **THEN** la app navega a `/login`
