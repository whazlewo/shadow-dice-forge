

## Bug: Adjustment Points Not Reflected in Attribute Totals

**Root cause**: The `attributes` state stores raw values starting at 1 for all attributes, and adjustment points from Step 2 are stored separately but never factored into the displayed totals or the budget math properly.

When you put 3 adj points into Agility, `attributes.agility` is still 1. You click + four times to reach 5, but `attrPts = max(0, 5 - 1 - 3) = 1` — only 1 attribute point is "detected." Meanwhile the **Total** column just shows `current` (the raw value), so it reads 5 instead of the correct effective total of `1 (base) + 3 (adj) + 1 (attr pts) = 5`. The numbers happen to coincide here, but the breakdown columns are misleading and the inline display doesn't reflect adjustment bonuses at all.

**Fix in `Step3Attributes.tsx`**:

1. **Change the effective total** to `base + adj + attr_points_spent`, where `attr_points_spent = attributes[attr] - 1` (every click above base = 1 attribute point).

2. **Change budget calculation**: `spentPoints = sum(attributes[attr] - 1)` for all attrs — remove the adjustment point subtraction. Adjustment points are free and already accounted for separately.

3. **Change max enforcement**: The effective total (`attributes[attr] + adj`) must not exceed the metatype max, so the raw max becomes `metatype_max - adj`.

4. **Update inline display**: Show the effective value (`current + adj`) instead of raw `current`. Update the range display accordingly.

5. **Update at-max detection**: Compare effective total against metatype max.

6. **Update breakdown table**: Total column = `base + adj + attrPts` = effective value.

7. **Also update `handleFinish` in `CharacterWizard.tsx`**: When building the final `attrs` object, add adjustment points to each attribute: `attributes[attr] + (adjustmentPoints[attr] || 0)`.

Only two files change: `Step3Attributes.tsx` (display/logic) and `CharacterWizard.tsx` (final save calculation).

