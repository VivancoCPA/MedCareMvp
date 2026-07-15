## MODIFIED Requirements

### Requirement: Comportamiento responsive del Sidebar
El `Sidebar` SHALL adaptar su modo de presentación según el ancho de viewport: expandido o manualmente colapsado en desktop, siempre colapsado a iconos en tablet, oculto por defecto en mobile.

#### Scenario: Desktop — sidebar expandido por defecto
- **WHEN** el viewport es mayor a 1024px y `sidebarCollapsed` es `false`
- **THEN** el `Sidebar` se muestra expandido (240px) con icono y label por ítem, siempre visible

#### Scenario: Desktop — sidebar colapsado manualmente
- **WHEN** el viewport es mayor a 1024px y `sidebarCollapsed` es `true`
- **THEN** el `Sidebar` se muestra colapsado (64px), solo iconos, siempre visible

#### Scenario: Tablet — sidebar colapsado a iconos
- **WHEN** el viewport está entre 768px y 1024px
- **THEN** el `Sidebar` se muestra colapsado (64px), solo iconos, siempre visible, sin
  control manual de colapso

#### Scenario: Mobile — sidebar oculto por defecto
- **WHEN** el viewport es menor a 768px y `sidebarOpen` es `false`
- **THEN** el `Sidebar` no es visible y no ocupa espacio en el layout

#### Scenario: Mobile — drawer abierto sobre overlay
- **WHEN** el viewport es menor a 768px y `sidebarOpen` es `true`
- **THEN** el `Sidebar` se muestra como drawer de altura completa sobre un overlay (`bg-black/50 fixed inset-0`) renderizado por `Shell`

## ADDED Requirements

### Requirement: Toggle manual de colapso del Sidebar en desktop
El `Sidebar` SHALL mostrar un botón en su pie, visible únicamente en viewport desktop (>1024px), que alterna `sidebarCollapsed` en `ui.store.ts`.

#### Scenario: Botón de colapso visible solo en desktop
- **WHEN** el viewport es mayor a 1024px
- **THEN** el pie del `Sidebar` muestra un botón para colapsar/expandir

#### Scenario: Botón de colapso ausente en tablet y mobile
- **WHEN** el viewport es menor o igual a 1024px
- **THEN** el pie del `Sidebar` no muestra el botón de colapso manual

#### Scenario: Click alterna el estado colapsado
- **WHEN** el usuario hace click en el botón de colapso en desktop
- **THEN** `sidebarCollapsed` cambia de valor y el `Sidebar` cambia de ancho (240px ↔ 64px)
  acorde al nuevo valor

#### Scenario: Icono y etiqueta reflejan el estado actual
- **WHEN** `sidebarCollapsed` es `false`
- **THEN** el botón muestra el icono de colapsar (`PanelLeftClose`) junto con una etiqueta de
  texto
- **WHEN** `sidebarCollapsed` es `true`
- **THEN** el botón muestra solo el icono de expandir (`PanelLeftOpen`), sin etiqueta de texto
