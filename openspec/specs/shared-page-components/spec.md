# shared-page-components

## Purpose

Componentes compartidos de contenido de página (`PageWrapper`, `EmptyState`)
que todos los módulos de features consumen para mantener padding, ancho
máximo y estados vacíos consistentes.

## Requirements

### Requirement: Padding responsive de PageWrapper
`PageWrapper` SHALL aplicar padding distinto según breakpoint y limitar el ancho de contenido a 1280px centrado.

#### Scenario: Padding en desktop/tablet
- **WHEN** el viewport es `md` (≥768px) o mayor
- **THEN** `PageWrapper` aplica `padding: 24px` (`--space-6`) a su contenido

#### Scenario: Padding en mobile
- **WHEN** el viewport es menor a `md` (768px)
- **THEN** `PageWrapper` aplica `padding: 16px` (`--space-4`) a su contenido

#### Scenario: Ancho máximo centrado
- **WHEN** el viewport es mayor a 1280px
- **THEN** el contenido de `PageWrapper` no supera 1280px de ancho y queda centrado horizontalmente

### Requirement: EmptyState con acción opcional
`EmptyState` SHALL renderizar un botón de acción únicamente cuando se le pasa la prop `action`.

#### Scenario: Sin acción
- **WHEN** `EmptyState` se renderiza sin la prop `action`
- **THEN** no se muestra ningún botón

#### Scenario: Con acción
- **WHEN** `EmptyState` se renderiza con `action={{ label, onClick }}`
- **THEN** se muestra un botón (`Button` variant `outline`) con `label`, y al presionarlo se ejecuta `onClick`

### Requirement: Icono por defecto de EmptyState
`EmptyState` SHALL usar el icono `Inbox` de Lucide cuando no se provee la prop `icon`.

#### Scenario: Sin icon prop
- **WHEN** `EmptyState` se renderiza sin la prop `icon`
- **THEN** se muestra el icono `Inbox`

#### Scenario: Con icon prop
- **WHEN** `EmptyState` se renderiza con `icon={CustomIcon}`
- **THEN** se muestra `CustomIcon` en lugar del icono por defecto

### Requirement: ConfirmModal renders a confirm/cancel dialog
`ConfirmModal` SHALL render a `Dialog`-based confirmation prompt with a configurable title,
message, and confirm/cancel labels, calling the provided callbacks and never applying any
destructive action itself.

#### Scenario: Open renders title and message
- **WHEN** `ConfirmModal` is rendered with `open={true}`, a `title`, and a `message`
- **THEN** both the title and message are visible in the dialog

#### Scenario: Confirm calls onConfirm only
- **WHEN** the user clicks the confirm button
- **THEN** `onConfirm` is called and `onCancel` is not called

#### Scenario: Cancel calls onCancel only
- **WHEN** the user clicks the cancel button or dismisses the dialog
- **THEN** `onCancel` is called and `onConfirm` is not called

#### Scenario: Closed renders nothing
- **WHEN** `ConfirmModal` is rendered with `open={false}`
- **THEN** no dialog content is visible

### Requirement: StatusBadge renders Activo/Inactivo from isActive
`StatusBadge` SHALL render an "Activo" or "Inactivo" badge driven entirely by a boolean
`isActive` prop, using the design system's mint/forest tokens for active and the
surface-strong/muted tokens for inactive.

#### Scenario: Active renders mint badge
- **WHEN** `StatusBadge` is rendered with `isActive={true}`
- **THEN** it renders the "Activo" label with `bg-[--color-signature-mint]` and
  `text-[--color-signature-forest]`

#### Scenario: Inactive renders muted badge
- **WHEN** `StatusBadge` is rendered with `isActive={false}`
- **THEN** it renders the "Inactivo" label with `bg-[--color-surface-strong]` and
  `text-[--color-muted]`
