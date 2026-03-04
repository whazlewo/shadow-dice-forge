

## Replace Fire Modes Text Field with Checkboxes + Tooltips

The four SR6 firing modes are: **SS** (Single-Shot), **SA** (Semi-Automatic), **BF** (Burst Fire), **FA** (Full Auto). Replace the free-text `fire_modes` field with a row of labeled checkboxes, each with a tooltip explaining the mode.

### Data Model
Keep `fire_modes` as a `string` internally (no type changes needed). Store as comma-joined abbreviations, e.g. `"SS,SA,BF"`. This keeps the character sheet display and save logic unchanged.

### Changes

**`src/components/wizard/Step5Gear.tsx`** — Replace `<Field label="Fire Modes" ...>` in `RangedFields` with a new `FireModeCheckboxes` component:
- Four checkboxes in a horizontal row: SS, SA, BF, FA
- Each wrapped in a `Tooltip` showing the full name and brief rule description
- Parse the current `fire_modes` string into a Set, toggle on check/uncheck, join back to string on change
- Styled with `text-xs font-mono` to match existing aesthetic

**`src/components/character/EquippedGearTab.tsx`** — No changes needed (already displays the string as-is via `StatPill`).

### Tooltip Content
- **SS** — "Single-Shot: One shot per Attack action, must reload after"
- **SA** — "Semi-Automatic: One shot per Attack action, +1 per additional"  
- **BF** — "Burst Fire: Fires a burst, −2 Defense Rating"
- **FA** — "Full Auto: Fires continuous, −6 Defense Rating"

Single file changed, ~30 lines added.

