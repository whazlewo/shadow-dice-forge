

## Show Metatype Racial Qualities on the Qualities Step

The metatype's racial qualities (e.g., Thermographic Vision, Low-light Vision, Built Tough) are already stored in `METATYPE_DATA` and displayed on the Metatype sub-step, but they don't appear on the Qualities page (Step 3) where the user manages all their qualities.

### Change

**`src/components/wizard/Step3Qualities.tsx`**
- Import `METATYPE_DATA` from `sr6-reference.ts`
- Read `state.metatype` to look up racial qualities
- If a metatype is selected and has racial qualities, render a read-only section at the top of the card (before the user-added qualities) showing them as badges labeled "RACIAL QUALITIES (from [Metatype])"
- These are display-only — not editable or removable, since they come from the metatype choice

