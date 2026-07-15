## ADDED Requirements

### Requirement: Colores fijos del Sidebar independientes del tema
El `Sidebar` SHALL usar colores de fondo y texto fijos (`--color-sidebar-bg`, `--color-sidebar-text`, `--color-sidebar-item-active`, `--color-sidebar-item-hover`) que no cambian entre `light` y `dark` mode.

#### Scenario: Fondo del Sidebar en light mode
- **WHEN** el tema activo es `light`
- **THEN** el `Sidebar` se muestra con fondo `#181d26` y texto/iconos legibles en blanco

#### Scenario: Fondo del Sidebar en dark mode
- **WHEN** el tema activo es `dark`
- **THEN** el `Sidebar` se muestra con el mismo fondo `#181d26` y texto/iconos en blanco, sin cambio visual respecto a light mode

#### Scenario: Toggle de tema no afecta al Sidebar
- **WHEN** el usuario alterna el tema de la aplicación
- **THEN** solo el área de contenido principal (canvas, superficies) cambia de color; el `Sidebar` permanece visualmente idéntico

#### Scenario: Ítem activo y hover sobre fondo fijo
- **WHEN** el usuario navega a una ruta o pasa el cursor sobre un ítem del `Sidebar`, en cualquiera de los dos temas
- **THEN** el ítem activo muestra `--color-sidebar-item-active` y el hover muestra `--color-sidebar-item-hover`, ambos legibles sobre el fondo fijo del `Sidebar`
