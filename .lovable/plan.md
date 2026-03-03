

## Add Armor Sub-type for Helmets & Shields

**Problem**: The current DR calculation picks only the single highest armor rating. In SR6, helmets and shields stack on top of body armor.

### Changes

**1. Add `subtype` field to `SR6Armor` and `WizardArmor`**

Add `subtype?: "body" | "helmet" | "shield"` to `SR6Armor` in `types/character.ts`. Default to `"body"` when unset (backward compat). Add the same to `WizardArmor`.

**2. Update DR calculation in `AttributesTab.tsx`**

Change `computeDerived` to compute:
```
DR = BOD + max(equipped body armor) + max(equipped helmet) + max(equipped shield) + dice_modifiers
```

Update the tooltip to show each contributing piece separately.

**3. Add subtype selector to armor UI**

In `CharacterSheet.tsx`, add a `subtype` field to the armor section's field list so users can pick body/helmet/shield. In `GenericListTab`, render it as a dropdown or simple text input.

**4. Add subtype to wizard `Step5Gear`**

When creating armor in the wizard, include the subtype selector defaulting to "body".

