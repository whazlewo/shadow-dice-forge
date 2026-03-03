

## Show Attribute Totals with Adjustment Point Breakdown

**What**: Add a summary section to the Attributes step (Step 3) that shows each attribute's total composition: base (1) + adjustment points (from Step 2) + attribute points spent = current value. This gives a clear picture of where every point came from.

**Changes to `src/components/wizard/Step3Attributes.tsx`**:

1. **Enhance each attribute row** to show a breakdown tooltip or inline label:
   - Base: 1
   - Adjustment: +N (from metatype step, if any)
   - Attribute pts: +N (spent in this step)
   - = Total

2. **Add a summary card/table below the attribute grid** showing:
   - All 8 base attributes with their current totals
   - Edge value (from adjustment points)
   - Magic/Resonance (if applicable, from Step 5 selection)
   - A column breakdown: Base | Adj. Pts | Attr. Pts | Total

3. **Visual treatment**: Use a compact table with `font-mono` styling and color-coded columns (neon-cyan for adjustment points, primary for totals) to keep the cyberpunk aesthetic.

No other files need changes — this is purely a display enhancement within Step3Attributes.

