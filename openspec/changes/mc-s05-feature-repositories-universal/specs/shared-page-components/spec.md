## ADDED Requirements

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
