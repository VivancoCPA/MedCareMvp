## ADDED Requirements

### Requirement: Toggle de tema en el TopBar
El `TopBar` SHALL mostrar un botón accesible que alterne el tema de la aplicación entre claro y oscuro invocando `useThemeStore().toggleTheme()`, ubicado entre el botón de menú y el dropdown de usuario.

#### Scenario: Botón muestra icono Moon en modo claro
- **WHEN** el tema activo es `light`
- **THEN** el `TopBar` muestra el icono `Moon` y el botón tiene `aria-label={t('layout.switchToDark')}`

#### Scenario: Botón muestra icono Sun en modo oscuro
- **WHEN** el tema activo es `dark`
- **THEN** el `TopBar` muestra el icono `Sun` y el botón tiene `aria-label={t('layout.switchToLight')}`

#### Scenario: Usuario alterna el tema
- **WHEN** el usuario presiona el botón de toggle de tema
- **THEN** se ejecuta `toggleTheme()` del `theme.store` y la app cambia de tema inmediatamente sin recargar la página
