

## Generalize AR Modifiers → Weapon Accessories

Replace the current `ar_modifiers` array with a richer `accessories` array on each weapon. Each accessory entry captures a name, optional AR modifier values, and a notes field. This replaces both the flat `accessories` text field on ranged weapons and the `ar_modifiers` array.

### Data Model Changes (`src/types/character.ts`)

```ts
export interface WeaponAccessory {
  name: string;              // e.g. "Smartgun System (Internal)"
  ar_modifier?: string;      // e.g. "+2/+2/+2/+2/+2" (optional)
  notes?: string;            // free text for other effects
}
```

- Add `accessories?: WeaponAccessory[]` to `SR6RangedWeapon` and `SR6MeleeWeapon`
- Remove the flat `accessories: string` field from `SR6RangedWeapon`
- Remove `ar_modifiers?: ARModifier[]` from both weapon types (replaced by accessory-level `ar_modifier`)
- Keep `ARModifier` type for now or remove — it's fully superseded

### Component: Rename `ARModifierList` → `AccessoryList`

Rework the component to render per-accessory rows with three fields:
- **Name** (text input, e.g. "Smartgun System")
- **AR Mod** (text input, optional, e.g. "+2/+2/+2/+2/+2") — same format tooltip as before
- **Notes** (small text input, optional, e.g. "Also adds +1 dice to attacks")

Add/Remove buttons work the same way as current AR modifier list.

### GenericListTab Changes

- Remove `accessories` from the ranged weapons `fields` array in `CharacterSheet.tsx`
- Remove `showARModifiers` prop — replace with `showAccessories` prop
- Render the new `AccessoryList` component below the weapon fields when `showAccessories` is true

### EquippedGearTab Changes

- Update `arTooltip` and `modifiedAR` to read from `accessories` array, extracting `ar_modifier` values from each accessory that has one
- List accessory names below the weapon (compact, like "Smartgun, Laser Sight, Scope")
- AR breakdown tooltip now uses accessory names as labels

### CharacterSheet.tsx

- Remove `"accessories"` from ranged weapon `fields` array
- Change `showARModifiers` to `showAccessories` on ranged and melee weapon GenericListTabs
- Data migration: existing `ar_modifiers` arrays will naturally map since the shape is compatible (source→name, values→ar_modifier)

