

## Equipped vs. Owned Gear

Adding an `equipped` boolean to gear items is a good idea — it solves the Defense Rating problem cleanly (only equipped armor contributes) and is faithful to SR6 rules where you can own gear you're not currently using.

### Changes

**1. Add `equipped` field to gear types**

Add an optional `equipped: boolean` field to the shared `WizardGearBase` interface and the character sheet gear types (`SR6Armor`, `SR6Gear`, `SR6RangedWeapon`, `SR6MeleeWeapon`, `SR6Augmentation`). Default to `true` for new items.

**2. Add equipped toggle to character sheet `GenericListTab`**

Add a checkbox column to each gear row in `GenericListTab`. This is a simple toggle — checked means equipped, unchecked means stowed. Show a small visual indicator (dimmed row or badge) for unequipped items.

**3. Add equipped toggle to wizard `Step5Gear`**

Same checkbox in the gear editor during character creation.

**4. Update Defense Rating calculation**

In `AttributesTab`, when computing Defense Rating, only consider armor items where `equipped === true` (or `equipped !== false` for backward compatibility with existing characters that lack the field). Use the highest equipped armor's defense rating.

**5. Update dice modifier scanning**

When scanning gear/augmentations for `dice_modifiers` (for attributes or skills), only include modifiers from equipped items. Augmentations are always "equipped" by nature (implanted), so they always contribute.

### Design decisions

- **Augmentations**: Always considered equipped (they're implanted). No toggle shown for augmentations.
- **Backward compatibility**: Existing characters without the `equipped` field treat all gear as equipped (`equipped !== false`).
- **No DB migration needed**: The field lives inside the existing JSONB columns.

