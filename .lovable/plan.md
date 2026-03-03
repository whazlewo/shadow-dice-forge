

## Problem

The `GenericListTab` stores **all values as strings** (from `e.target.value`). The armor `rating` field ends up as `"2"` instead of `2`. This causes:

1. **String concatenation instead of addition** — `"2" + "3"` = `"23"` instead of `5`
2. **String comparison instead of numeric** — `"9" > "10"` is `true` in string comparison
3. **Users typing "+2"** works with `parseFloat` but only if we actually parse

The fix isn't about the "+" prefix specifically — it's that `GenericListTab` never converts numeric fields to numbers.

## Plan

### 1. Add `numericFields` prop to `GenericListTab`

Add an optional `numericFields?: string[]` prop. When a field is in this list:
- Render the input with `type="number"`
- Parse the value with `parseFloat` before storing (strip any "+" prefix, default to `0` on `NaN`)

### 2. Mark `rating` and `capacity` as numeric in `CharacterSheet.tsx`

Pass `numericFields={["rating", "capacity"]}` to the Armor section. Also mark numeric fields on other sections (e.g., `reach` on melee weapons, `loyalty`/`connection` on contacts).

### 3. Parse armor ratings in `AttributesTab.tsx` defensively

Add `Number()` or `parseFloat()` calls around `a.rating` in `computeDerived` as a safety net, so even if old string data exists, it still works correctly.

