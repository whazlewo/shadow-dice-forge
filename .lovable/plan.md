

## Bug: Attribute Modifiers Leaking into Dice Pools

### Problem

The `calculateDicePool` function in `src/lib/dice-pool.ts` iterates over **all** `dice_modifiers` on augmentations (and gear/qualities). It filters by `!mod.skill || mod.skill === skill.name`, but it does **not** check whether the modifier is an **attribute-level** modifier (i.e., has `mod.attribute` set).

The Wired Reflexes augmentation has 3 attribute modifiers from the EffectsEditor:
- `{ attribute: "initiative", value: 2 }`
- `{ attribute: "initiative_dice", value: 2 }`
- `{ attribute: "reaction", value: 2 }`

All three have `mod.skill === undefined`, so `!mod.skill` is `true`, and they all pass the filter — getting incorrectly added as "+2" skill modifiers to every skill roll. That accounts for the extra +6, pushing 12d6 to 18d6.

### Fix

In `src/lib/dice-pool.ts`, add a guard to **skip modifiers that have `mod.attribute` set**, since those are attribute-level effects handled separately by `AttributesTab.tsx`. This applies to the three loops (qualities, augmentations, gear) around lines 25-47.

Change the condition from:
```
if ((!mod.skill || mod.skill === skill.name) && modifierApplies(...))
```
to:
```
if (!mod.attribute && (!mod.skill || mod.skill === skill.name) && modifierApplies(...))
```

### Files Changed

- **`src/lib/dice-pool.ts`** — Add `!mod.attribute` check to all three modifier loops (qualities line 27, augmentations line 35, gear line 43)

### Result

The Firearms pool should drop from 18d6 to **12d6** (Agility 4 + Firearms 4 + Smartlink +2 + Spec +2), and attribute-level effects will continue to work correctly through the existing `collectDiceModifiers` system in `AttributesTab.tsx`.

