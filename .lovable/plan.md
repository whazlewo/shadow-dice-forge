

## Add Read-Only / Edit Mode Toggle to Core Tab Sections

Add a toggle between read-only display and edit mode for **Personal Data**, **Skills**, and **Contacts** on the Core tab. Each section gets a small pencil icon in the card header that switches it into edit mode (showing the current input-based UI). In read-only mode, values display as styled text instead of inputs.

### Approach

**1. PersonalInfoTab** — Add `editing` state (default `false`).
- Read-only mode: render each field as a `<span>` with the label above it, same grid layout.
- Edit mode: render current `<Input>` fields as-is.
- Pencil/check icon in the `CardHeader` toggles between modes. On switching back to read-only, trigger the existing blur/save callbacks.

**2. SkillsTab** — Add `editing` state (default `false`).
- Read-only mode: render each skill as a compact row showing name, rating, attribute, specialization/expertise (if set), and dice pool — no inputs, no expand/collapse, no Add/Remove buttons.
- Edit mode: current collapsible UI with selects, inputs, add/remove.
- Pencil/check icon in header toggles.

**3. Contacts (GenericListTab)** — Add an optional `readOnlyToggle` prop.
- When enabled, the component manages its own `editing` state.
- Read-only mode: render items as compact text rows (field values separated by " | " or in a mini grid), no Add/Remove buttons, no inputs.
- Edit mode: current input-based UI.
- Only the Contacts instance on the Core tab passes `readOnlyToggle={true}`.

### UI Details
- Toggle icon: `Pencil` (lucide) when read-only → `Check` when editing, placed in the CardHeader next to the title.
- Read-only text uses `font-mono text-sm` styling to match the current aesthetic.
- Empty/unset fields show "—" in read-only mode.
- No changes to save logic — edits still auto-save on each field change as they do now.

### Files Changed
- `src/components/character/PersonalInfoTab.tsx` — add editing toggle + read-only render
- `src/components/character/SkillsTab.tsx` — add editing toggle + read-only render
- `src/components/character/GenericListTab.tsx` — add optional `readOnlyToggle` prop + read-only render
- `src/pages/CharacterSheet.tsx` — pass `readOnlyToggle` to the Contacts GenericListTab

