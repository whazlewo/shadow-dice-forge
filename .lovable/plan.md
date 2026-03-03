

## Add Initiative Dice Modifiers

**Problem**: Initiative is hardcoded to `1D6`. Augmentations like Wired Reflexes should add extra initiative dice (e.g. Wired Reflexes 2 = +2D6), but there's no mechanism for it.

**Approach**: Reuse the existing `dice_modifiers` system with a new attribute key `"initiative_dice"`.

### 1. Scan for initiative dice modifiers in `computeDerived` (`AttributesTab.tsx`)

Use the same pattern as Defense Rating modifiers: scan augmentations, gear, qualities, and adept powers for `dice_modifiers` where `attribute === "initiative_dice"`. Sum them up, add to base 1, and build a tooltip showing the breakdown.

```
Base: 1D6
Wired Reflexes II: +2D6
Total: REA + INT + 3D6
```

Also apply the same scan for `"initiative"` (flat bonus to the score, e.g. from REA-boosting augmentations that also add to initiative base).

### 2. No type changes needed

`DiceModifier` already supports `attribute?: string` and `value: number`. Users just enter `initiative_dice` as the attribute on their augmentation's dice modifier. The augmentation UI already supports editing dice modifiers.

### 3. Cap at 5D6

SR6 caps physical initiative at 5D6. Clamp the total dice to `Math.min(totalDice, 5)`.

