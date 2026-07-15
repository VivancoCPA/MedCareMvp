## Context

MedFamilyCare es una SPA React + Vite con datos mock en memoria. No existe backend real — todo opera sobre `mockUsers[]`, un array mutable importado desde `src/mock/`. El router ya tiene rutas `/login`, `/login/change-password` y `/login/forgot-password` definidas con elementos placeholder. `ProtectedRoute` y `RoleGuard` existen como pass-through sin lógica real. El `auth.store` (Zustand) existe pero puede carecer de persistencia.

Este change activa la capa de autenticación completa sin cambiar la arquitectura de capas ya acordada: `mock → service → hook → component`.

## Goals / Non-Goals

**Goals:**
- Activar login real contra `mockUsers` con validación de credenciales y estado de cuenta
- Implementar flujo forzado de cambio de contraseña (`mustChangePassword`)
- Implementar recuperación de contraseña (simulada, respuesta genérica)
- Activar `ProtectedRoute` y `RoleGuard` con redirección real
- Agregar persistencia de sesión via `persist` middleware de Zustand
- Agregar `DevRoleSwitcher` para agilizar QA manual en dev — eliminado en producción por tree-shaking

**Non-Goals:**
- Backend real o JWT — fuera de alcance en fase mock
- 2FA o autenticación OAuth
- Rate limiting o bloqueo de cuenta tras intentos fallidos
- Auditoría de sesiones
- Manejo de tokens de recuperación (el flujo solo simula el envío)

## Decisions

### D1 — Capa de servicio como único punto de contacto con `mockUsers`

**Decisión**: Solo `auth.service.ts` importa desde `src/mock/`. Hooks y componentes nunca tocan el array directamente.

**Por qué**: Mantiene la regla de capas del proyecto. Cuando se reemplace la capa mock por un backend real, el cambio es quirúrgico: solo el servicio cambia.

**Alternativa descartada**: Importar `mockUsers` desde hooks — rompe la separación de capas y distribuye la dependencia del mock.

---

### D2 — `AuthError` tipada vs. string de error

**Decisión**: `class AuthError extends Error { code: AuthErrorCode }`. Los componentes leen `mutation.error.code` para traducir a i18n.

**Por qué**: Permite discriminación de errores en los componentes sin parsing de strings. TypeScript infiere el tipo correcto cuando `mutation.isError === true`.

**Alternativa descartada**: Devolver errores como strings — no es type-safe y acopla los mensajes de UI al servicio.

---

### D3 — `getDashboardRoute` extraído a `src/router/utils.ts`

**Decisión**: La función que mapea `UserRole → ruta` vive en `src/router/utils.ts`, importada tanto por los hooks como por los guards.

**Por qué**: Sin este archivo, `useLogin` y `RoleGuard` duplicarían el switch o se importarían mutuamente, creando una dependencia circular (`router → hooks → router`).

**Alternativa descartada**: Definir la función en el hook y reimportarla en el guard — introduce dependencia circular.

---

### D4 — Persistencia de sesión con `persist` middleware de Zustand

**Decisión**: El `auth.store` usa `persist` con `name: APP_CONFIG.session.storageKey`, serializando en `localStorage`.

**Por qué**: Sin persistencia, cualquier recarga de página destruye la sesión y el usuario es redirigido al login. Comportamiento no esperado incluso en modo mock.

**Riesgo aceptado**: El objeto `User` completo se serializa. Si la forma del tipo cambia, el valor en localStorage puede ser incompatible. Mitigación: en modo mock la sesión es efímera de todas formas (no hay tokens reales).

---

### D5 — `DevRoleSwitcher` integrado en `LoginForm`, no en una ruta separada

**Decisión**: El componente se renderiza arriba del formulario, dentro de `LoginForm.tsx`, visible solo en `import.meta.env.DEV`.

**Por qué**: Vite reemplaza `import.meta.env.DEV` en build de producción por `false`, lo que permite al tree-shaker eliminar todo el bloque. Si estuviera en una ruta separada, la eliminación sería menos confiable.

**Por qué no login automático al seleccionar**: Mantiene todos los flujos de error (credenciales inválidas, cuenta desactivada) ejercitables. El QA sigue necesitando hacer click en "Ingresar".

---

### D6 — Schemas Zod con mensajes i18n evaluados en runtime

**Decisión**: Los schemas llaman a `t('clave')` directamente en las restricciones de Zod, no en los mensajes de error de React Hook Form.

**Por qué**: Zod evalúa los mensajes de error cuando se ejecuta la validación (no al importar el módulo), así que `t()` ya está inicializado cuando los formularios se montan. Evita tener que re-crear schemas al cambiar el idioma.

**Riesgo**: Si un schema se instancia antes de que i18next esté listo (SSR, tests), los mensajes serán las claves crudas. Mitigación: no hay SSR en este proyecto; en tests se inicializa i18next antes de montar componentes.

## Risks / Trade-offs

| Riesgo | Mitigación |
|--------|------------|
| Mutación de `mockUsers` en memoria para cambio de contraseña no sobrevive recarga | Comportamiento documentado y esperado en modo mock; se resuelve con backend real |
| `persist` serializa `User` completo — cambios de tipo rompen sesiones guardadas | En modo mock no hay tokens sensibles; borrar localStorage es el workaround trivial |
| `DevRoleSwitcher` expone `passwordHash` en opciones del Select en DOM de dev | Solo activo en `npm run dev`; jamás en producción; aceptable para QA interno |
| Schemas Zod con `t()` — tests que montan formularios necesitan i18next inicializado | Documentado en convenciones de test; patrón ya establecido en el proyecto |
