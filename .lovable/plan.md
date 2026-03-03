

## Improving Specialization Selection for Skills (SR6 Rules)

### SR6 Specialization Rules
- A specialization costs **1 skill point** and gives **+2 dice** when applicable.
- An **expertise** (further narrowing) costs an additional **1 point** and gives another **+1 die** (requires a specialization first).
- Each skill has a defined set of valid specializations (not freeform text).
- A skill must have **at least 1 rank** before taking a specialization.

### Current Problem
The current UI shows a freeform text input for specializations — users have to guess/type valid options and there's no support for expertises.

### Proposed Changes

**1. Add a `SKILL_SPECIALIZATIONS` data map** (`src/data/sr6-reference.ts` or inline in Step4Skills)
- A `Record<string, string[]>` mapping each skill to its valid specializations (e.g., `Firearms: ["Pistols", "Rifles", "Shotguns", "Submachine Guns"]`).

**2. Replace the freeform Input with a Select dropdown**
- When a skill has rating >= 1, show a `Select` component populated with the valid specializations for that skill, plus an empty "None" option.
- Selecting a specialization costs 1 point (already accounted for in the point math).

**3. Add optional Expertise support**
- When a specialization is selected, show a second smaller `Select` for expertise options (a subset or the same list narrowed further, depending on skill).
- Update the `WizardSkill` type to include an `expertise?: string` field.
- Expertise costs an additional 1 point — update the `spentPoints` calculation.

**4. Update point cost display**
- Update the header description to mention expertise cost.
- Adjust `spentPoints` calculation: `rating + (specialization ? 1 : 0) + (expertise ? 1 : 0)`.

### Technical Details

- **Types**: Add `expertise` field to `WizardSkill` in `CharacterWizard.tsx` and `SR6Skill` in `types/character.ts`.
- **Data**: Add `SKILL_SPECIALIZATIONS: Record<string, string[]>` with canonical SR6 specialization lists per skill.
- **UI**: Use the existing `Select` component from `@/components/ui/select`. Show specialization dropdown only when `rating > 0`. Show expertise dropdown only when a specialization is chosen.
- **Point math**: Update `spentPoints` reducer to include expertise cost.
- **Finish handler**: Pass expertise through to the final character object.

