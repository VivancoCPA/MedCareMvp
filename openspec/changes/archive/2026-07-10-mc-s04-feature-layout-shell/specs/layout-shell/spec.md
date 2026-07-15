## ADDED Requirements

### Requirement: Navegación lateral diferenciada por rol
El `Sidebar` SHALL renderizar el conjunto de ítems de navegación correspondiente al `role` recibido por `Shell`, usando las claves i18n `nav.<role>.*`.

#### Scenario: Ítems de navegación para superadmin
- **WHEN** `Shell` recibe `role="superadmin"`
- **THEN** el `Sidebar` muestra 6 ítems: Usuarios, Médicos, Especialidades, Centros médicos, Aseguradoras, Farmacias

#### Scenario: Ítems de navegación para admin
- **WHEN** `Shell` recibe `role="admin"`
- **THEN** el `Sidebar` muestra 4 ítems: Dashboard, Mi grupo, Repositorios del grupo, Configuración

#### Scenario: Ítems de navegación para member
- **WHEN** `Shell` recibe `role="member"`
- **THEN** el `Sidebar` muestra 6 ítems: Dashboard, Mi perfil de salud, Mis citas, Mis exámenes, Mis notas, Configuración

### Requirement: Indicador de ítem activo
`SidebarNavItem` SHALL indicar visualmente cuál ítem corresponde a la ruta actual usando el estado `isActive` de `NavLink`.

#### Scenario: Ruta actual resaltada
- **WHEN** la ruta actual coincide con el `to` de un `SidebarNavItem`
- **THEN** ese ítem se renderiza con fondo `bg-primary-active` y borde izquierdo de 3px

### Requirement: Comportamiento responsive del Sidebar
El `Sidebar` SHALL adaptar su modo de presentación según el ancho de viewport: expandido en desktop, colapsado a iconos en tablet, oculto por defecto en mobile.

#### Scenario: Desktop — sidebar expandido
- **WHEN** el viewport es mayor a 1024px
- **THEN** el `Sidebar` se muestra expandido (240px) con icono y label por ítem, siempre visible

#### Scenario: Tablet — sidebar colapsado a iconos
- **WHEN** el viewport está entre 768px y 1024px
- **THEN** el `Sidebar` se muestra colapsado (64px), solo iconos, siempre visible

#### Scenario: Mobile — sidebar oculto por defecto
- **WHEN** el viewport es menor a 768px y `sidebarOpen` es `false`
- **THEN** el `Sidebar` no es visible y no ocupa espacio en el layout

#### Scenario: Mobile — drawer abierto sobre overlay
- **WHEN** el viewport es menor a 768px y `sidebarOpen` es `true`
- **THEN** el `Sidebar` se muestra como drawer de altura completa sobre un overlay (`bg-black/50 fixed inset-0`) renderizado por `Shell`

### Requirement: Persistencia del estado del sidebar
`ui.store.ts` SHALL persistir `sidebarCollapsed` en `localStorage` bajo la clave `med-care-ui`; `sidebarOpen` SHALL iniciar siempre en `false` en cada carga de la app.

#### Scenario: sidebarCollapsed persiste tras recargar
- **WHEN** el usuario colapsa el sidebar manualmente y recarga la página
- **THEN** el sidebar permanece colapsado tras la recarga

#### Scenario: sidebarOpen siempre inicia cerrado
- **WHEN** la app se carga (o recarga), independientemente del estado previo
- **THEN** `sidebarOpen` es `false`

### Requirement: Cierre automático del drawer al navegar
`useSidebar` SHALL cerrar el drawer (`sidebarOpen = false`) cada vez que cambia la ruta activa.

#### Scenario: Navegar con el drawer abierto en mobile
- **WHEN** el usuario está en un viewport menor a 768px con el drawer abierto y selecciona un ítem de navegación
- **THEN** la app navega a la ruta seleccionada y el drawer se cierra automáticamente

### Requirement: Identidad contextual en el TopBar
El `TopBar` SHALL mostrar un texto contextual distinto según el `role` recibido.

#### Scenario: Texto contextual para superadmin
- **WHEN** `Shell` recibe `role="superadmin"`
- **THEN** el `TopBar` muestra `t('layout.superadminPanel')` ("Panel de administración")

#### Scenario: Texto contextual para admin con grupo asignado
- **WHEN** `Shell` recibe `role="admin"` y `group.store.currentGroup` no es `null`
- **THEN** el `TopBar` muestra el `name` del grupo actual

#### Scenario: Texto contextual para admin sin grupo asignado
- **WHEN** `Shell` recibe `role="admin"` y `group.store.currentGroup` es `null`
- **THEN** el `TopBar` muestra `t('layout.noGroup')` ("Sin grupo")

#### Scenario: Texto contextual para member
- **WHEN** `Shell` recibe `role="member"`
- **THEN** el `TopBar` muestra el nombre completo del usuario autenticado (`user.firstName + ' ' + user.lastName`)

### Requirement: Logout desde el TopBar
El dropdown del `TopBar` SHALL ofrecer una opción de cerrar sesión que limpie el estado de autenticación y redirija a `/login`.

#### Scenario: Usuario cierra sesión
- **WHEN** el usuario abre el dropdown del avatar y selecciona "Cerrar sesión"
- **THEN** `authStore.logout()` se ejecuta y la app navega a `/login`

### Requirement: Acceso a la cuenta desde el TopBar
El dropdown del `TopBar` SHALL ofrecer una opción "Mi cuenta" que navegue a la página de configuración del rol activo.

#### Scenario: Usuario navega a su configuración
- **WHEN** el usuario abre el dropdown del avatar y selecciona "Mi cuenta"
- **THEN** la app navega a `/[rol]/settings` usando el rol actual

### Requirement: Toggle del drawer desde el TopBar
El `TopBar` SHALL mostrar un botón para abrir el drawer del sidebar únicamente cuando el viewport es menor a 1024px.

#### Scenario: Botón de menú visible en mobile/tablet estrecho
- **WHEN** el viewport es menor a 1024px
- **THEN** el `TopBar` muestra un botón `Menu` que, al presionarse, establece `sidebarOpen = true`

#### Scenario: Botón de menú ausente en desktop
- **WHEN** el viewport es mayor a 1024px
- **THEN** el `TopBar` no muestra el botón de menú
