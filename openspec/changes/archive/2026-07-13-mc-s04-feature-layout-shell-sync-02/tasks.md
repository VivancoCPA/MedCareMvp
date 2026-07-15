## 1. i18n

- [x] 1.1 Agregar claves `layout.switchToDark` y `layout.switchToLight` en `src/i18n/locales/es.json`
- [x] 1.2 Agregar claves `layout.switchToDark` y `layout.switchToLight` en `src/i18n/locales/en.json`

## 2. TopBar

- [x] 2.1 Importar `Sun`, `Moon` de `lucide-react` y `useThemeStore` de `@/stores/theme.store` en `TopBar.tsx`
- [x] 2.2 Leer `theme` y `toggleTheme` desde `useThemeStore()` dentro del componente
- [x] 2.3 Agregar botón de toggle entre el botón de menú y el `DropdownMenu` de usuario, con `aria-label` traducido y icono según `theme` (`Moon` en claro, `Sun` en oscuro)
- [x] 2.4 Usar solo clases de tokens existentes (`text-body`, `text-ink`, `bg-surface-soft`, etc.) — sin colores hex hardcodeados

## 3. Verificación

- [x] 3.1 Probar el toggle en ambos temas — confirmar que no hay texto invisible ni elementos ilegibles
- [x] 3.2 Confirmar que el botón es accesible por teclado y tiene `aria-label` correcto en ambos estados
- [x] 3.3 `npx tsc --noEmit` → 0 errores
