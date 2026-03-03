

## Restructure Gear Step with Category-Specific Fields & Flow to Character Sheet

This is a significant feature touching the type system, the wizard gear step, the wizard finalization logic, and the character sheet display.

### SR6 Gear Categories & Their Fields

Based on SR6 rules, gear breaks down into these categories with distinct fields:

```text
Category          Fields (beyond name/cost/qty/avail)
─────────────────────────────────────────────────────────────
Ranged Weapons    dv, attack_ratings, fire_modes, ammo, accessories
Melee Weapons     dv, attack_ratings, reach
Armor             defense_rating, capacity, modifications
Electronics       device_rating, attributes (A/S/D/F), programs
Augmentations     type (cyber/bio), essence_cost, rating, effects, dice_modifiers
Vehicles/Drones   handling, speed, body, armor, sensor, pilot, seats
Miscellaneous     notes, dice_modifiers
```

Every category also has: `name`, `cost`, `quantity`, `availability`.  
Augmentations, gear, and qualities can carry `dice_modifiers` that affect skill/attribute pools.

### Plan

#### 1. Expand the `WizardGearItem` type (`src/types/character.ts`)

Replace the flat `WizardGearItem` with a **discriminated union** keyed on `category`. Each variant carries category-specific fields plus shared fields (`id`, `name`, `cost`, `quantity`, `availability`). Categories:

- `ranged_weapon` — dv, attack_ratings, fire_modes, ammo, accessories
- `melee_weapon` — dv, attack_ratings, reach
- `armor` — defense_rating, capacity, modifications
- `electronics` — device_rating, programs, notes
- `augmentation` — type (cyber/bio), essence_cost, rating, effects, dice_modifiers
- `vehicle` — handling, speed, body, armor, sensor, pilot, seats
- `miscellaneous` — notes, dice_modifiers

#### 2. Rebuild `Step5Gear.tsx` with category-specific forms

- When user picks a category from the dropdown, render a **category-specific form section** below the shared fields (name, cost, qty, availability)
- Extract each category's form into a small inline component or a switch block within the file
- Keep the nuyen budget badges at top

#### 3. Update `handleFinish` in `CharacterWizard.tsx`

When creating the character, split `purchasedGear` by category and map them into the correct character columns:

```text
ranged_weapon  → character.ranged_weapons (as SR6RangedWeapon[])
melee_weapon   → character.melee_weapons (as SR6MeleeWeapon[])
armor          → character.armor (as SR6Armor[])
augmentation   → character.augmentations (as SR6Augmentation[])
vehicle        → character.vehicles (as SR6Vehicle[])
electronics    → character.gear (as SR6Gear[], with matrix_stats updated)
miscellaneous  → character.gear (as SR6Gear[])
```

This ensures gear appears in the correct character sheet tabs automatically.

#### 4. Dice modifier support in the wizard

For categories that support it (augmentations, miscellaneous gear), add an optional `dice_modifiers` array editor — a simple repeating row with skill dropdown, value input, and source label. These already flow through to `SkillsTab.calculateDicePool` on the character sheet since it reads `augmentations[].dice_modifiers` and `gear[].dice_modifiers`.

#### 5. Essence tracking for augmentations

When a user adds augmentation-category gear, sum `essence_cost` and subtract from the base essence (6.0). Display an "Essence" badge alongside the nuyen budget badges.

### Files Changed

| File | Change |
|---|---|
| `src/types/character.ts` | Replace `WizardGearItem` with discriminated union type |
| `src/components/wizard/Step5Gear.tsx` | Full rebuild: category-specific forms, essence tracking, dice modifier editor |
| `src/pages/CharacterWizard.tsx` | Update `handleFinish` to split gear into correct character columns |

### What already works (no changes needed)

- **Character sheet display**: `CharacterSheet.tsx` already has separate tabs for ranged, melee, armor, augmentations, gear, vehicles — once `handleFinish` maps data to the right columns, it will display automatically
- **Dice pool breakdown**: `SkillsTab.calculateDicePool` already reads `dice_modifiers` from qualities, augmentations, and gear — so any modifiers set in the wizard will show up with source labels in the skill breakdown on the character sheet

