

## Revised Option D: AR Modifier List with Source Annotations

**SR6 context**: Multiple AR modifiers on a single weapon are common (Smartgun +2, Laser Sight +1, Scope +1, APDS ammo, etc.), and some apply to specific range bands only. A single flat bonus field won't cut it.

### Design

Add an `ar_modifiers` array to each weapon (ranged and melee), following the same pattern as the existing `dice_modifiers` on augmentations/qualities. Each modifier entry has:

```ts
interface ARModifier {
  source: string;        // e.g. "Smartgun System (Internal)"
  values: string;        // e.g. "+2/+2/+2/+2/+2" or "+0/+0/+0/+1/+1"
}
```

Users enter the source name and per-range-band values. The system parses the base AR string and each modifier's values string, sums them per band, and displays the **modified AR** in the Equipped Weapons & Armor section.

### Changes

**1. Types (`src/types/character.ts`)**
- Add `ARModifier` interface
- Add `ar_modifiers?: ARModifier[]` to `SR6RangedWeapon` and `SR6MeleeWeapon`

**2. GenericListTab or a new sub-component**
- Below the existing fields for ranged/melee weapons, add a small "AR Modifiers" sub-list with Add/Remove buttons
- Each row: a text input for `source` and a text input for `values` (with the same AR tooltip for format)

**3. EquippedGearTab (`EquippedGearTab.tsx`)**
- Parse base AR + all `ar_modifiers` entries, sum per range band
- Display the **modified AR** in the StatPill instead of the raw base
- Add a tooltip breakdown showing:
  ```
  Base:       8/10/6/—/—
  Smartgun:  +2/+2/+2/+2/+2
  Scope:     +0/+0/+0/+1/+1
  Total:     10/12/8/3/3
  ```
- Dash (`—`) bands stay as dashes (no modifier applied)

**4. CharacterSheet.tsx**
- No structural changes needed; `ar_modifiers` will persist as part of the weapon JSON in the database

### Why this works
- Reuses the familiar "list of modifiers with source labels" pattern already in the codebase
- Per-range-band values handle both flat bonuses (Smartgun) and range-specific bonuses (Scope)
- Tooltip breakdown gives full transparency
- No schema migration needed — it's stored in the existing JSON column

