

## Make Exotic Weapons Specialization Free-Text with Suggestions

**Problem**: Exotic Weapons specializations are open-ended in SR6 — there's no fixed list. The current dropdown only offers "Lasers" and "Flamethrowers", which is too restrictive.

**Solution**: Replace the `Select` dropdown with a combobox-style input for Exotic Weapons specializations (and expertise), allowing users to either pick from common suggestions or type a custom value.

### Approach

We already have `cmdk` installed (used by the `Command` component). We can use the existing `Popover` + `Command` components to build an inline combobox, or more simply use a standard `Input` with a `datalist` for native browser autocomplete — which is the lightest-weight option.

**Recommended**: Use a simple `<Input>` with optional suggested values for the Exotic Weapons case, since it's the only skill needing this. All other skills keep the existing `Select` dropdown.

### Changes

**`src/data/sr6-reference.ts`**
- Expand the Exotic Weapons suggestions list with common examples: `["Lasers", "Flamethrowers", "Monofilament Whip", "Gyrojet Pistol", "Net Gun", "Bola", "Garrote"]`
- These remain suggestions only, not an exhaustive list.

**`src/components/wizard/Step4Skills.tsx`**
- For the specialization/expertise inputs, detect when the skill is "Exotic Weapons"
- Render a text `<Input>` instead of a `<Select>` for that skill
- Optionally pair it with a `<datalist>` element for browser-native autocomplete suggestions
- Wire the input's `onChange` to call `updateSkill(i, { specialization: value })` directly
- Apply the same pattern for the expertise field

### UI Behavior
- **All other skills**: unchanged `Select` dropdowns with fixed options
- **Exotic Weapons**: a text input where users can type anything (e.g., "Monofilament Whip"), with a dropdown of common suggestions appearing as they type

