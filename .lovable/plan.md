

## Problem

Currently, dice modifiers on gear/augmentations apply **globally** to all rolls for a skill. A Smartlink with `value: 1` on Firearms applies +1 to every Firearms-based weapon pool. In SR6 rules, Smartlink should be +1 (gear accessory) or +2 (cyberware implant), and only applies to weapons with a Smartgun System accessory.

## Solution

Add a `DiceModifierEditor` to the character sheet's Gear and Augmentations sections (it currently only exists in the wizard), so users can edit modifier values post-creation. Additionally, add a **weapon-specific** modifier system so bonuses like Smartlink only apply to weapons that have matching accessories.

### Changes

**1. Extract `DiceModifierEditor` to shared component** (`src/components/character/DiceModifierEditor.tsx`)
- Move from `Step5Gear.tsx` into its own file so both wizard and character sheet can use it.

**2. Add `DiceModifierEditor` to character sheet gear editing** (`GenericListTab.tsx`)
- When editing Augmentations or Gear items, show the `DiceModifierEditor` below the other fields so users can adjust modifier values (e.g., change Smartlink from +1 to +2 after installing cyberware).

**3. Add weapon-specific modifier matching** (`src/lib/dice-pool.ts`)
- Update `calculateWeaponPool` to check if a gear/augmentation modifier has a `requires_accessory` field. If set, only apply the modifier when the weapon has a matching accessory name.
- Add `requires_accessory?: string` to `DiceModifier` type.

**4. Update `DiceModifier` type** (`src/types/character.ts`)
- Add optional `requires_accessory?: string` field — when set, the modifier only applies to weapons with an accessory whose name contains this string (e.g., "Smartgun").

### Result
- Users can set Smartlink to +2 on their cyberware augmentation via the character sheet
- The +2 only applies to weapons that have a "Smartgun System" accessory installed
- The Pool tooltip shows the correct breakdown

