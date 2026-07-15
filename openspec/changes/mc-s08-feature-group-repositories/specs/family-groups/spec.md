## MODIFIED Requirements

### Requirement: Group onboarding flow
`/admin/group/onboarding` SHALL render a 3-step stepper (doctors, centers/pharmacies, members), each step individually skippable via "Omitir por ahora" without discarding progress already made in a prior step, ending with navigation back to `/admin/group` once every step is completed or skipped.

#### Scenario: Each step can be skipped independently
- **WHEN** the Admin clicks "Omitir por ahora" on the doctors step
- **THEN** the stepper advances to the centers/pharmacies step without discarding any group data already entered

#### Scenario: Completing or skipping all steps returns to the group page
- **WHEN** the Admin completes or skips the third (members) step
- **THEN** the app navigates to `/admin/group`

#### Scenario: Onboarding is re-enterable
- **WHEN** the Admin navigates to `/admin/group/onboarding` again after finishing it once
- **THEN** the stepper renders from its first step, usable again with no error

#### Scenario: Doctors step supports importing and creating, in addition to skipping
- **WHEN** the Admin views the doctors onboarding step
- **THEN** the Admin can import existing doctors from the universal catalog or create a new doctor with universal-catalog propagation, and can still click "Omitir por ahora" to advance without adding any

#### Scenario: Centers/pharmacies step supports importing and creating, in addition to skipping
- **WHEN** the Admin views the centers/pharmacies onboarding step
- **THEN** the Admin can import existing medical centers and pharmacies from the universal catalog or create new ones with universal-catalog propagation, and can still click "Omitir por ahora" to advance without adding any
